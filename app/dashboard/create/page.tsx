"use client";
import {useMemo,useState} from "react";
import {PAYMENT_COUNTRIES} from "@/lib/payment-providers";
import {EXTRA_PAYMENT_COUNTRIES} from "@/lib/payment-extra";

const types=[
 ["url","🔗","Website"],["text","📝","Text"],["phone","📞","Phone"],["ussd","💳","Local Payment"],
 ["wifi","📶","Wi‑Fi"],["email","✉️","Email"],["whatsapp","💬","WhatsApp"],["location","📍","Location"],["contact","👤","Contact"],
 ["camera-photo","📸","Camera Photo"],["camera-video","🎥","Camera Video"],["video","🎬","Video"],["image","🖼️","Image"],["audio","🎵","Audio"],["pdf","📄","PDF"],["file","📁","File"],["gallery","🖼️","Gallery"],["app","📱","App Download"]
];
const countries=[...PAYMENT_COUNTRIES,...EXTRA_PAYMENT_COUNTRIES];

export default function Create(){
 const [type,setType]=useState("url"),[name,setName]=useState(""),[value,setValue]=useState("");
 const [phone,setPhone]=useState(""),[country,setCountry]=useState("SO"),[provider,setProvider]=useState("zaad-usd");
 const [paymentEdit,setPaymentEdit]=useState(false),[paymentPrefix,setPaymentPrefix]=useState(""),[paymentMode,setPaymentMode]=useState<"direct"|"menu"|"custom">("direct"),[paymentTemplate,setPaymentTemplate]=useState("");
 const [wifiSsid,setWifiSsid]=useState(""),[wifiPassword,setWifiPassword]=useState(""),[wifiSecurity,setWifiSecurity]=useState("WPA"),[wifiHidden,setWifiHidden]=useState(false);
 const [qr,setQr]=useState(""),[publicUrl,setPublicUrl]=useState(""),[error,setError]=useState("");
 const [cameraFacing,setCameraFacing]=useState<"front"|"back">("back"),[videoSeconds,setVideoSeconds]=useState("10"),[cameraTitle,setCameraTitle]=useState("Camera capture"),[cameraMessage,setCameraMessage]=useState("Allow camera access to continue.");

 const selectedCountry=useMemo(()=>countries.find(c=>c.code===country)||countries[0],[country]);
 const providers=selectedCountry?.providers||[];
 const selectedProvider=providers.find(p=>p.id===provider)||providers[0];
 const effectivePrefix=paymentEdit?paymentPrefix:(selectedProvider?.prefix||"");
 const effectiveMode=paymentEdit?paymentMode:(selectedProvider?.mode||"menu");
 const effectiveTemplate=paymentEdit?paymentTemplate:(selectedProvider?.template||"");

 function loadProvider(p:any){
  setPaymentEdit(false);setPaymentPrefix(p?.prefix||"");setPaymentMode(p?.mode==="direct"?"direct":p?.mode==="menu"?"menu":"custom");setPaymentTemplate(p?.template||"");
 }
 function chooseCountry(code:string){setCountry(code);const c=countries.find(x=>x.code===code);const p=c?.providers[0];setProvider(p?.id||"");loadProvider(p);}
 function chooseProvider(id:string){const p=providers.find(x=>x.id===id);setProvider(id);loadProvider(p);}
 function editPayment(){
  setPaymentEdit(true);setPaymentPrefix(selectedProvider?.prefix||"");
  setPaymentMode(selectedProvider?.mode==="direct"?"direct":selectedProvider?.mode==="menu"?"menu":"custom");
  setPaymentTemplate(selectedProvider?.template||(selectedProvider?.mode==="direct"?((selectedProvider?.prefix||"*XXX*")+"{number}*{amount}#"):(selectedProvider?.prefix||"")));
 }
 async function submit(e:React.FormEvent){
  e.preventDefault();setError("");
  const isCamera=type==="camera-photo"||type==="camera-video";
  const endpoint=isCamera?"/api/scan":"/api/qr";
  const payload=isCamera?{
   name,title:cameraTitle||name,message:cameraMessage,mode:type==="camera-video"?"video":"photo",camera:cameraFacing,
   seconds:Math.min(60,Math.max(3,Number(videoSeconds)||10))
  }:{
   name,type,value,phone,wifiSsid,wifiPassword,wifiSecurity,wifiHidden,
   paymentCountry:selectedCountry?.name||country,paymentProvider:selectedProvider?.name||provider,
   paymentPrefix:effectivePrefix,paymentMode:effectiveMode,paymentTemplate:effectiveTemplate,
   paymentCurrency:selectedProvider?.currency||""
  };
  const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const d=await r.json();if(!r.ok){setError(d.error||"Failed");return}
  setQr(d.qrUrl);setPublicUrl(d.publicUrl);
 }
 const preview=effectiveMode==="direct"
  ? (effectiveTemplate||((effectivePrefix||"*XXX*")+"{number}*{amount}#")).replace("{number}",phone||"7801020").replace("{amount}","AMOUNT")
  : effectiveMode==="custom"
  ? (effectiveTemplate||"*XXX*{number}*{amount}#").replace("{number}",phone||"7801020").replace("{amount}","AMOUNT")
  : effectivePrefix;

 return <div className="dashboard">
  <aside className="side"><div className="brand">Skan<span>Makery</span></div><nav><a href="/dashboard">Dashboard</a><a className="nav-active" href="/dashboard/create">＋ Create QR</a><a href="/dashboard/qrs">My QR Codes</a></nav></aside>
  <main className="main">
   <div className="page-head"><div><span className="eyebrow">QR STUDIO</span><h1>Create something scannable</h1><p>Create QR experiences for payments, Wi‑Fi, camera capture, media and more.</p></div></div>
   <div className="type-grid">{types.map(([id,icon,label])=><button type="button" className={"type-card "+(type===id?"active":"")} onClick={()=>setType(id)} key={id}><span>{icon}</span><b>{label}</b><small>{id==="url"?"Open a website":id==="ussd"?"Country + wallet + number":id.startsWith("camera-")?"Permission-based camera":"Create QR"}</small></button>)}</div>
   <div className="studio"><form className="form" onSubmit={submit}>
    <div className="field"><label>QR Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. My Local Payment QR" required/></div>
    {(type==="camera-photo"||type==="camera-video")?<>
      <div className="payment-section-head"><div><b>{type==="camera-video"?"🎥 Camera Video":"📸 Camera Photo"}</b><span>Clear permission-based camera capture for a QR scan.</span></div></div>
      <div className="field"><label>Capture title</label><input value={cameraTitle} onChange={e=>setCameraTitle(e.target.value)} placeholder="e.g. Take a photo" required/></div>
      <div className="field"><label>Message shown before camera permission</label><textarea rows={3} value={cameraMessage} onChange={e=>setCameraMessage(e.target.value)} placeholder="Explain clearly what will be captured and why." required/></div>
      <div className="payment-grid"><div className="field"><label>Camera</label><select value={cameraFacing} onChange={e=>setCameraFacing(e.target.value as "front"|"back")}><option value="back">Back camera</option><option value="front">Front camera</option></select></div>
      {type==="camera-video"&&<div className="field"><label>Video duration (seconds)</label><input type="number" min={3} max={60} value={videoSeconds} onChange={e=>setVideoSeconds(e.target.value)}/></div>}</div>
      <div className="wifi-note"><span>🔐</span><div><b>Permission is always explicit</b><p>The visitor sees a SkanMakery permission notice and must press Allow before the browser requests camera access.</p></div></div>
    </>:    {type==="ussd"?<>
      <div className="payment-section-head"><div><b>🌍 Local payment</b><span>Choose a country and payment service.</span></div></div>
      <div className="payment-grid">
       <div className="field"><label>Country</label><select value={country} onChange={e=>chooseCountry(e.target.value)}>{countries.map(c=><option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select></div>
       <div className="field"><label>Payment service</label><select value={selectedProvider?.id||""} onChange={e=>chooseProvider(e.target.value)}>{providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      </div>
      <div className="provider-info"><div><span>Provider</span><b>{selectedProvider?.name}</b></div><div><span>Default USSD</span><b>{selectedProvider?.prefix}</b></div><div><span>Status</span><b>{selectedProvider?.verification==="verified"?"✓ Verified":"⚠ Needs verification"}</b></div></div>
      <div className="field"><label>Customer / Recipient Number</label><input inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="e.g. 7801020" required/><small className="helper">The number is inserted into the payment format.</small></div>
      <button type="button" className="btn light" onClick={editPayment}>{paymentEdit?"✓ Editing USSD format":"✏️ Edit USSD format"}</button>
      {paymentEdit&&<div className="payment-edit-box">
       <div className="payment-grid"><div className="field"><label>USSD code / prefix</label><input value={paymentPrefix} onChange={e=>setPaymentPrefix(e.target.value)} placeholder="*880*"/></div>
       <div className="field"><label>Flow</label><select value={paymentMode} onChange={e=>setPaymentMode(e.target.value as "direct"|"menu"|"custom")}><option value="direct">Direct — number + amount</option><option value="menu">Menu — open code</option><option value="custom">Custom template</option></select></div></div>
       {paymentMode!=="menu"&&<div className="field"><label>USSD template</label><input value={paymentTemplate} onChange={e=>setPaymentTemplate(e.target.value)} placeholder="*880*{number}*{amount}#"/><small className="helper">Use <b>{"{number}"}</b> for recipient and <b>{"{amount}"}</b> for amount.</small></div>}
       <div className="custom-warning"><b>{selectedProvider?.verification==="verified"?"✏️ Editable verified default":"⚠️ Custom / not verified"}</b><span>Changing the code or template means SkanMakery uses exactly what you entered. Verify it with your provider before publishing.</span></div>
      </div>}
      <div className="dynamic-amount-note"><span>💡</span><div><b>Amount is entered after scanning</b><p>The QR does not lock a fixed amount. The payer can enter any allowed amount.</p></div></div>
      <div className="ussd-preview"><span>Payment flow preview</span><b>{preview}</b><small>{effectiveMode==="menu"?"Provider menu opens; amount is entered there.":"The real amount replaces AMOUNT after scanning."}</small></div>
    </>:type==="wifi"?<>
      <div className="payment-section-head"><div><b>📶 Instant Wi‑Fi QR</b><span>Scan with a supported phone camera to offer Join / Connect.</span></div></div>
      <div className="field"><label>Wi‑Fi Network Name (SSID)</label><input value={wifiSsid} onChange={e=>setWifiSsid(e.target.value)} placeholder="e.g. SkanMakery Guest" required/></div>
      <div className="payment-grid"><div className="field"><label>Security</label><select value={wifiSecurity} onChange={e=>setWifiSecurity(e.target.value)}><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">Open / No password</option></select></div><div className="field"><label>Password</label><input type="password" value={wifiPassword} onChange={e=>setWifiPassword(e.target.value)} placeholder={wifiSecurity==="nopass"?"No password":"Enter Wi‑Fi password"} required={wifiSecurity!=="nopass"}/></div></div>
      <label className="wifi-check"><input type="checkbox" checked={wifiHidden} onChange={e=>setWifiHidden(e.target.checked)}/><span><b>Hidden network</b><small>The SSID is not broadcast by the router.</small></span></label>
      <div className="wifi-note"><span>⚡</span><div><b>Native connection</b><p>Supported phone cameras can recognize the standard Wi‑Fi payload and offer Join / Connect. The exact confirmation depends on the device.</p></div></div>
    </>:type==="phone"?<div className="field"><label>Phone Number</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+2517801020" required/></div>
    :<div className="field"><label>{type==="url"?"Website URL":type==="text"?"Text / Message":"Value"}</label><textarea rows={type==="text"?6:3} value={value} onChange={e=>setValue(e.target.value)} placeholder={type==="url"?"https://example.com":"Enter your content..."} required/></div>}
    {error&&<p className="error">{error}</p>}<button className="btn primary create-btn">{type==="wifi"?"Generate Wi‑Fi QR →":(type==="camera-photo"||type==="camera-video")?"Create Camera QR →":"Generate QR →"}</button>
   </form>
   {qr&&<div className="result-card"><div className="success">✓ QR created</div><img className="qr-image" src={qr}/><p className="public-url">{publicUrl}</p>{type==="wifi"&&<p className="scan-hint">Scan directly with the phone camera or built-in QR scanner.</p>}<div className="result-actions"><a className="btn primary" href={publicUrl} target="_blank">Test Scan ↗</a><button className="btn light" onClick={()=>window.print()}>🖨 Print QR</button></div></div>}
   </div>
  </main>
 </div>
}