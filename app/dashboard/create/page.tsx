"use client";
import {useMemo,useState} from "react";
import {PAYMENT_COUNTRIES} from "@/lib/payment-providers";
import {EXTRA_PAYMENT_COUNTRIES} from "@/lib/payment-extra";

const types=[
 ["url","🔗","Website"],["text","📝","Text"],["phone","📞","Phone"],
 ["ussd","💳","Local Payment"],["email","✉️","Email"],["whatsapp","💬","WhatsApp"],
 ["wifi","📶","Wi‑Fi"],["location","📍","Location"],["contact","👤","Contact"]
];

const countries=[...PAYMENT_COUNTRIES,...EXTRA_PAYMENT_COUNTRIES];

export default function Create(){
 const [type,setType]=useState("url"),[name,setName]=useState(""),[value,setValue]=useState("");
 const [phone,setPhone]=useState(""),[country,setCountry]=useState("SO"),[provider,setProvider]=useState("zaad-usd");
 const [qr,setQr]=useState(""),[publicUrl,setPublicUrl]=useState(""),[error,setError]=useState("");

 const selectedCountry=useMemo(()=>countries.find(c=>c.code===country)||countries[0],[country]);
 const providers=selectedCountry?.providers||[];
 const selectedProvider=providers.find(p=>p.id===provider)||providers[0];

 function chooseCountry(code:string){
  setCountry(code);
  const c=countries.find(x=>x.code===code);
  setProvider(c?.providers[0]?.id||"");
 }

 async function submit(e:React.FormEvent){
  e.preventDefault();setError("");
  const r=await fetch("/api/qr",{method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    name,type,value,phone,
    paymentCountry:selectedCountry?.name||country,
    paymentProvider:selectedProvider?.name||provider,
    paymentPrefix:selectedProvider?.prefix||"",
    paymentMode:selectedProvider?.mode||"menu"
   })
  });
  const d=await r.json();
  if(!r.ok){setError(d.error||"Failed");return}
  setQr(d.qrUrl);setPublicUrl(d.publicUrl);
 }

 const preview=selectedProvider?.mode==="direct"
  ? (selectedProvider.prefix+(phone||"7801020")+"*AMOUNT#")
  : (selectedProvider?.prefix||"");

 return <div className="dashboard">
  <aside className="side"><div className="brand">Skan<span>Makery</span></div><nav>
   <a href="/dashboard">Dashboard</a><a className="nav-active" href="/dashboard/create">＋ Create QR</a><a href="/dashboard/qrs">My QR Codes</a>
  </nav></aside>
  <main className="main">
   <div className="page-head"><div><span className="eyebrow">QR STUDIO</span><h1>Create something scannable</h1>
   <p>Build a local-payment QR once. The payer chooses the amount after scanning.</p></div></div>

   <div className="type-grid">{types.map(([id,icon,label])=>
    <button type="button" className={"type-card "+(type===id?"active":"")} onClick={()=>setType(id)} key={id}>
     <span>{icon}</span><b>{label}</b><small>{id==="url"?"Open a website":id==="ussd"?"Country + wallet + number":id==="phone"?"Open phone dialer":"Create QR"}</small>
    </button>)}
   </div>

   <div className="studio">
    <form className="form" onSubmit={submit}>
     <div className="field"><label>QR Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. My Local Payment QR" required/></div>

     {type==="ussd" ? <>
      <div className="payment-section-head"><div><b>🌍 Local payment</b><span>Choose the payer's country and wallet</span></div></div>
      <div className="payment-grid">
       <div className="field"><label>Country</label><select value={country} onChange={e=>chooseCountry(e.target.value)}>
        {countries.map(c=><option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
       </select></div>
       <div className="field"><label>Payment service</label><select value={selectedProvider?.id||""} onChange={e=>setProvider(e.target.value)}>
        {providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
       </select></div>
      </div>
      <div className="provider-info">
       <div><span>Provider</span><b>{selectedProvider?.name}</b></div>
       <div><span>USSD</span><b>{selectedProvider?.prefix}</b></div>
       <div><span>Flow</span><b>{selectedProvider?.mode==="direct"?"Amount can be prefilled":"Provider menu"}</b></div>
      </div>
      <div className="field"><label>Customer / Recipient Number</label><input inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="e.g. 7801020" required/>
       <small className="helper">Do not enter the USSD code here. SkanMakery adds it automatically.</small>
      </div>
      <div className="dynamic-amount-note"><span>💡</span><div><b>Amount is not saved in this QR</b><p>When someone scans it, the payment page asks them to enter <b>1, 3, 10</b> or any amount they want.</p></div></div>
      <div className="ussd-preview"><span>Payment flow preview</span><b>{preview}</b><small>{selectedProvider?.mode==="direct"?"The real amount is inserted after scanning.":"This provider opens its USSD menu; the amount is entered there."}</small></div>
     </> : type==="phone" ? <div className="field"><label>Phone Number</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+2517801020" required/></div>
       : <div className="field"><label>{type==="url"?"Website URL":type==="text"?"Text / Message":"Value"}</label><textarea rows={type==="text"?6:3} value={value} onChange={e=>setValue(e.target.value)} placeholder={type==="url"?"https://example.com":"Enter your content..."} required/></div>}

     {error&&<p className="error">{error}</p>}<button className="btn primary create-btn">Generate QR →</button>
    </form>

    {qr&&<div className="result-card"><div className="success">✓ QR created</div><img className="qr-image" src={qr}/><p className="public-url">{publicUrl}</p>
     <div className="result-actions"><a className="btn primary" href={publicUrl} target="_blank">Test Scan ↗</a><button className="btn light" onClick={()=>window.print()}>🖨 Print QR</button></div>
    </div>}
   </div>
  </main>
 </div>
}