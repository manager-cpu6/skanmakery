import {notFound,redirect} from "next/navigation";
import {getDb} from "@/lib/mongodb";

function isExternalUrl(value:string){
 try{const u=new URL(value);return u.protocol==="http:"||u.protocol==="https:"}
 catch{return false}
}

function phoneHref(value:string){
 return "tel:"+value.replace(/#/g,"%23");
}

export default async function QRView({
 params,
 searchParams
}:{params:Promise<{slug:string}>,searchParams:Promise<{amount?:string}>}){
 const {slug}=await params;
 const {amount=""}=await searchParams;
 const db=await getDb();
 const qr=await db.collection("qrcodes").findOne({slug,active:true});
 if(!qr)notFound();

 await db.collection("qrcodes").updateOne({_id:qr._id},{$inc:{scanCount:1}});
 const target=String(qr.target||"");

 if(qr.type==="url"&&isExternalUrl(target))redirect(target);
 if(qr.type==="whatsapp"&&target.startsWith("http"))redirect(target);

 if(qr.type==="ussd"){
  const prefix=String(qr.paymentPrefix||"");
  const number=String(qr.paymentNumber||"");
  const mode=String(qr.paymentMode||"menu");
  const cleanAmount=String(amount||"").replace(/[^0-9.]/g,"");

  if(cleanAmount && mode==="direct" && prefix && number){
   const dial=prefix+number+"*"+cleanAmount+"#";
   return redirect(phoneHref(dial));
  }

  const menuHref=prefix?phoneHref(prefix):"tel:";
  return <main className="scan-page"><div className="scan-card payment-scan-card">
   <div className="scan-icon">💳</div>
   <div className="payment-badge">SkanMakery Payment</div>
   <h1>{qr.name}</h1>
   <p className="scan-subtitle">{qr.paymentProvider||"Local payment"} · {qr.paymentCountry||""}</p>
   <div className="payment-number"><span>Recipient</span><b>{number}</b></div>
   <form method="GET" className="amount-form">
    <label htmlFor="amount">Enter payment amount</label>
    <div className="amount-input-wrap"><input id="amount" name="amount" inputMode="decimal" pattern="[0-9.]*" placeholder="1.00" defaultValue={cleanAmount} required/><span>{qr.currency||""}</span></div>
    {mode==="direct"
      ? <button className="btn primary scan-action" type="submit">Continue to Phone →</button>
      : <button className="btn primary scan-action" type="button" formAction={menuHref}>Open {qr.paymentProvider||"Payment"} →</button>}
   </form>
   {mode==="direct"
     ? <p className="scan-hint">Amount is entered here only after scanning. The QR itself does not store a fixed amount.</p>
     : <p className="scan-hint">This provider uses a menu-based USSD flow. The amount will be entered in the payment menu after you open it.</p>}
  </div></main>;
 }

 if((qr.type==="phone")&&target.startsWith("tel:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">📞</div><h1>{qr.name}</h1><p>Phone action is ready.</p><a className="btn primary scan-action" href={target}>Open Phone →</a><p className="scan-hint">If your phone does not open automatically, tap the button above.</p></div></main>;
 if(qr.type==="email"&&target.startsWith("mailto:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">✉️</div><h1>{qr.name}</h1><a className="btn primary scan-action" href={target}>Open Email →</a></div></main>;
 if(qr.type==="location"&&target.startsWith("geo:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">📍</div><h1>{qr.name}</h1><a className="btn primary scan-action" href={target}>Open Location →</a></div></main>;
 return <main className="scan-page"><div className="scan-card"><div className="scan-icon">✓</div><h1>{qr.name}</h1><div className="scan-value">{target}</div></div></main>;
}