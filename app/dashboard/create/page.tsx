"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {PAYMENT_COUNTRIES} from "@/lib/payment-providers";
import {EXTRA_PAYMENT_COUNTRIES} from "@/lib/payment-extra";

const types=[
 ["url","🔗","Website"],["text","📝","Text"],["phone","📞","Phone"],["ussd","💳","Local Payment"],
 ["wifi","📶","Wi‑Fi"],["email","✉️","Email"],["whatsapp","💬","WhatsApp"],["location","📍","Location"],["contact","👤","Contact"],
 ["prank","😈","PRANK SCAN"],["video","🎬","Video"],["image","🖼️","Image"],["audio","🎵","Audio"],["pdf","📄","PDF"],["file","📁","File"],["gallery","🖼️","Gallery"],["app","📱","App Download"]
];
const countries=[...PAYMENT_COUNTRIES,...EXTRA_PAYMENT_COUNTRIES];

export default function Create(){
 const [maker,setMaker]=useState<"qr"|"barcode">("qr"),[barcodeFormat,setBarcodeFormat]=useState("code128"),[barcodeImage,setBarcodeImage]=useState(""),[type,setType]=useState("url"),[name,setName]=useState(""),[value,setValue]=useState("");
 const [phone,setPhone]=useState(""),[country,setCountry]=useState("SO"),[provider,setProvider]=useState("zaad-usd");
 const [paymentEdit,setPaymentEdit]=useState(false),[paymentPrefix,setPaymentPrefix]=useState(""),[paymentMode,setPaymentMode]=useState<"direct"|"menu"|"custom">("direct"),[paymentTemplate,setPaymentTemplate]=useState("");
 const [wifiSsid,setWifiSsid]=useState(""),[wifiPassword,setWifiPassword]=useState(""),[wifiSecurity,setWifiSecurity]=useState("WPA"),[wifiHidden,setWifiHidden]=useState(false);
 const [qr,setQr]=useState(""),[publicUrl,setPublicUrl]=useState(""),[error,setError]=useState(""),[mediaFile,setMediaFile]=useState<File|null>(null),[darkColor,setDarkColor]=useState("#111827"),[lightColor,setLightColor]=useState("#FFFFFF"),[logoDataUrl,setLogoDataUrl]=useState(""),[prankMode,setPrankMode]=useState<"video"|"photo">("video"),[location,setLocation]=useState<any>(null),[locating,setLocating]=useState(false);
 const [creditBalance,setCreditBalance]=useState<number|null>(null),resultRef=useRef<HTMLDivElement|null>(null);
 const [cameraFacing,setCameraFacing]=useState<"front"|"back">("back"),[videoSeconds,setVideoSeconds]=useState("10"),[cameraTitle,setCameraTitle]=useState("Camera capture"),[cameraMessage,setCameraMessage]=useState("Allow camera access to continue.");

 useEffect(()=>{fetch("/api/credits").then(r=>r.ok?r.json():null).then(x=>x&&setCreditBalance(Number(x.balance||0))).catch(()=>{});},[]);
 useEffect(()=>{if(qr)requestAnimationFrame(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"center"}));},[qr]);
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
 function readLogo(file:File|null){if(!file){setLogoDataUrl("");return}if(file.size>500000){setError("Logo must be 500KB or smaller.");return}const fr=new FileReader();fr.onload=()=>setLogoDataUrl(String(fr.result||""));fr.readAsDataURL(file)}
 function getCreatorLocation(){setError("");setLocating(true);if(!navigator.geolocation){setError("Your browser does not support location access.");setLocating(false);return}navigator.geolocation.getCurrentPosition(p=>{setLocation({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy});setLocating(false)},e=>{setError(e.code===1?"Location access was denied. Please allow it in your browser.":"Could not get your location. Turn on Location and try again.");setLocating(false)},{enableHighAccuracy:true,timeout:15000,maximumAge:0})}
 function editPayment(){
  setPaymentEdit(true);setPaymentPrefix(selectedProvider?.prefix||"");
  setPaymentMode(selectedProvider?.mode==="direct"?"direct":selectedProvider?.mode==="menu"?"menu":"custom");
  setPaymentTemplate(selectedProvider?.template||(selectedProvider?.mode==="direct"?((selectedProvider?.prefix||"*XXX*")+"{number}*{amount}#"):(selectedProvider?.prefix||"")));
 }
 async function submit(e:React.FormEvent){
  e.preventDefault();setError("");
  if(maker==="barcode"){const r=await fetch("/api/barcode",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,value,format:barcodeFormat})});const d=await r.json();if(!r.ok){setError(d.error||"Could not create barcode");return}setBarcodeImage(d.image);setPublicUrl(d.publicUrl);return;}
  if(type==="location"||type==="prank"){
   if(type==="location"&&!location){setError("First allow location access and select your current location.");return}
   const r=await fetch("/api/scan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,title:type==="location"?(name+" location request"):(cameraTitle||name),message:type==="location"?"This QR opens the exact location selected by the creator. Visitors are not asked for their own location.":cameraMessage,type:type==="location"?"location":"camera",mode:prankMode,camera:type==="location"?"back":cameraFacing,latitude:type==="location"?location.latitude:undefined,longitude:type==="location"?location.longitude:undefined,accuracy:type==="location"?location.accuracy:undefined,design:{dark:darkColor,light:lightColor,logoDataUrl}})});
   const d=await r.json();if(!r.ok){setError(d.error||"Failed");return}setQr(d.qrUrl);setPublicUrl(d.publicUrl);return;
  }
  let uploadedValue=value;
  if(["video","image","audio","pdf","file","gallery"].includes(type)&&!mediaFile&&!value.trim()){setError("Please upload a file from your phone/computer or provide a direct URL.");return;}
  if(["video","image","audio","pdf","file","gallery"].includes(type)&&mediaFile){
   const fd=new FormData();fd.append("file",mediaFile);fd.append("kind","scan-content");
   const up=await fetch("/api/media/upload",{method:"POST",body:fd});const ux=await up.json();
   if(!up.ok){setError(ux.error||"Upload failed");return}uploadedValue=ux.url;
  }
  const endpoint="/api/qr";
  const payload={
   name,type,value:uploadedValue,phone,wifiSsid,wifiPassword,wifiSecurity,wifiHidden,design:{dark:darkColor,light:lightColor,logoDataUrl},
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
   <div className="page-head"><div><span className="eyebrow">QR STUDIO</span><h1>Create something scannable</h1><p>Create QR experiences for payments, Wi‑Fi, camera capture, media and more.</p></div><a className="credit-top-pill create-credit-pill" href="/dashboard/credits">⚡ <b>{creditBalance===null?"…":creditBalance}</b> credits · Add credits</a></div>
   <div className="maker-switch"><button type="button" className={maker==="qr"?"active":""} onClick={()=>setMaker("qr")}>▦ QR Code</button><button type="button" className={maker==="barcode"?"active":""} onClick={()=>setMaker("barcode")}>▥ Barcode</button></div>
   {maker==="barcode"?<div className="studio"><form className="form" onSubmit={submit}><div className="payment-section-head"><div><b>▥ BARCODE STUDIO</b><span>Create a standard barcode for products, IDs, inventory and more.</span></div></div><div className="field"><label>Barcode name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Product barcode" required/></div><div className="field"><label>Barcode type</label><select value={barcodeFormat} onChange={e=>setBarcodeFormat(e.target.value)}><option value="code128">Code 128 — general purpose</option><option value="ean13">EAN-13 — retail</option><option value="upca">UPC-A — retail</option><option value="code39">Code 39</option><option value="itf14">ITF-14</option></select></div><div className="field"><label>Value / number</label><input value={value} onChange={e=>setValue(e.target.value)} placeholder={barcodeFormat==="code128"?"Enter text or number":"Enter numbers only"} required/></div>{error&&<p className="error">{error}</p>}<button className="btn primary create-btn">Generate Barcode →</button></form>{barcodeImage&&<div className="result-card"><div className="success">✓ Barcode created</div><img className="barcode-image" src={barcodeImage} alt={name}/><p className="public-url">{publicUrl}</p><div className="result-actions"><a className="btn primary" href={barcodeImage} download={name+"-barcode.png"}>Download PNG</a><button className="btn light" onClick={()=>window.print()}>🖨 Print</button></div></div>}</div>:<><div className="type-grid">{types.map(([id,icon,label])=><button type="button" className={"type-card "+(type===id?"active":"")} onClick={()=>setType(id)} key={id}><span>{icon}</span><b>{label}</b><small>{id==="url"?"Open a website":id==="ussd"?"Country + wallet + number":id.startsWith("camera-")?"Permission-based camera":"Create QR"}</small></button>)}</div>
   <div className="studio"><form className="form" onSubmit={submit}>
    <div className="field"><label>QR Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. My Local Payment QR" required/></div><div className="qr-design-box"><div><b>🎨 SCAN DESIGN</b><span>Give your QR a brand color and optional center logo. High error correction is kept for reliable scanning.</span></div><div className="qr-design-grid"><label><span>QR color</span><input type="color" value={darkColor} onChange={e=>setDarkColor(e.target.value)}/></label><label><span>Background</span><input type="color" value={lightColor} onChange={e=>setLightColor(e.target.value)}/></label><label className="qr-logo-upload"><span>Center logo</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>readLogo(e.target.files?.[0]||null)}/>{logoDataUrl&&<img src={logoDataUrl} alt="Logo preview"/>}</label></div></div>
    {type==="location"?<><div className="payment-section-head"><div><b>📍 LOCATION SCAN</b><span>Select the exact location now. Visitors will see this saved point on Google Maps.</span></div></div><div className="location-builder"><div className="location-builder-icon">📍</div><div><h3>{location?"Location selected":"Use my current location"}</h3><p>{location?"This location will be saved in the QR. The visitor will not be asked for location access.":"Allow your browser to access your current location before generating the QR."}</p></div><button type="button" className="btn primary" onClick={getCreatorLocation} disabled={locating}>{locating?"Getting location…":location?"✓ Location selected":"Allow location access"}</button>{location&&<small>Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} · accuracy ~{Math.round(location.accuracy||0)}m</small>}</div></>:type==="prank"?<>
      <div className="payment-section-head"><div><b>😈 PRANK SCAN</b><span>One button for camera photo or video capture.</span></div></div>
      <div className="capture-tabs"><button type="button" className={prankMode==="video"?"active":""} onClick={()=>setPrankMode("video")}>🎥 Video</button><button type="button" className={prankMode==="photo"?"active":""} onClick={()=>setPrankMode("photo")}>📸 Photo</button></div>
      <div className="field"><label>Capture title</label><input value={cameraTitle} onChange={e=>setCameraTitle(e.target.value)} placeholder="PRANK SCAN"/></div>
      <div className="field"><label>Permission explanation</label><textarea rows={3} value={cameraMessage} onChange={e=>setCameraMessage(e.target.value)} placeholder="Explain clearly what will happen after permission." required/></div>
      <div className="field"><label>Camera</label><select value={cameraFacing} onChange={e=>setCameraFacing(e.target.value as "front"|"back")}><option value="back">Back camera</option><option value="front">Front camera</option></select></div>
      <div className="wifi-note"><span>🔐</span><div><b>Explicit browser permission</b><p>The visitor must continue and grant camera access before capture begins.</p></div></div>
    </>:type==="video"||type==="image"||type==="audio"||type==="pdf"||type==="file"||type==="gallery"?<>
      <div className="field"><label>{type==="video"?"Choose a video":type==="image"?"Choose a photo/image":"Choose your file"}</label><input type="file" accept={type==="video"?"video/*":type==="image"?"image/*":type==="audio"?"audio/*":type==="pdf"?"application/pdf":type==="gallery"?"image/*":"*/*"} onChange={e=>setMediaFile(e.target.files?.[0]||null)} required={!value.trim()}/><small className="helper">{mediaFile?"Selected: "+mediaFile.name:"Tap to choose from your phone or computer. Required unless you enter a direct URL."} · Max 100MB.</small></div>
      <div className="field"><label>Or direct URL</label><input value={value} onChange={e=>setValue(e.target.value)} placeholder="https://…"/></div>
    </>:type==="ussd"?<>
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
    {error&&<p className="error">{error}</p>}<button className="btn primary create-btn">{type==="wifi"?"Generate Wi‑Fi QR →":(type==="prank")?"Create Camera QR →":"Generate QR →"}</button>
   </form>
   {qr&&<div ref={resultRef} className="result-card"><div className="success">✓ QR created</div><img className="qr-image" src={qr}/><p className="public-url">{publicUrl}</p>{type==="wifi"&&<p className="scan-hint">Scan directly with the phone camera or built-in QR scanner.</p>}<div className="result-actions"><a className="btn primary" href={publicUrl} target="_blank">Test Scan ↗</a><button className="btn light" onClick={()=>window.print()}>🖨 Print QR</button></div></div>}
   </div></>}
  </main>
 </div>
}