import {notFound,redirect} from "next/navigation";
import {getDb} from "@/lib/mongodb";
function isExternalUrl(v:string){try{const u=new URL(v);return u.protocol==="http:"||u.protocol==="https:"}catch{return false}}
function phoneHref(v:string){return "tel:"+v.replace(/#/g,"%23")}
function buildUssd(t:string,n:string,a:string){return String(t||"").replace(/\{number\}/gi,n).replace(/\{amount\}/gi,a)}
export default async function QRView({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<{amount?:string}>}){
 const {slug}=await params;const {amount=""}=await searchParams;const db=await getDb();const qr=await db.collection("qrcodes").findOne({slug,active:true});if(!qr)notFound();
 await db.collection("qrcodes").updateOne({_id:qr._id},{$inc:{scanCount:1}});
 const target=String(qr.target||"");
 if(qr.type==="url"&&isExternalUrl(target))redirect(target);
 if(qr.type==="whatsapp"&&target.startsWith("http"))redirect(target);
 if(qr.type==="ussd"){
  const prefix=String(qr.paymentPrefix||""),number=String(qr.paymentNumber||""),mode=String(qr.paymentMode||"menu"),template=String(qr.paymentTemplate||"");
  const clean=String(amount||"").replace(/[^0-9.]/g,"");
  if(clean&&(mode==="direct"||mode==="custom")&&number)return redirect(phoneHref(buildUssd(template||((prefix||"*XXX*")+"{number}*{amount}#"),number,clean)));
  return <main className="scan-page"><div className="scan-card payment-scan-card"><div className="scan-icon">💳</div><div className="payment-badge">SkanMakery Payment</div><h1>{qr.name}</h1><p className="scan-subtitle">{qr.paymentProvider||"Local payment"} · {qr.paymentCountry||""}</p><div className="payment-number"><span>Recipient</span><b>{number}</b></div>{mode==="menu"?<div className="amount-form"><label>Payment amount is entered in the provider menu</label><a className="btn primary scan-action" href={prefix?phoneHref(prefix):"tel:"}>Open {qr.paymentProvider||"Payment"} →</a></div>:<form method="GET" className="amount-form"><label htmlFor="amount">Enter payment amount</label><div className="amount-input-wrap"><input id="amount" name="amount" inputMode="decimal" placeholder="1.00" defaultValue={clean} required/><span>{qr.currency||""}</span></div><button className="btn primary scan-action">Continue to Phone →</button></form>}</div></main>;
 }
 if(qr.type==="phone"&&target.startsWith("tel:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">📞</div><h1>{qr.name}</h1><a className="btn primary scan-action" href={target}>Open Phone →</a></div></main>;
 if(qr.type==="email"&&target.startsWith("mailto:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">✉️</div><h1>{qr.name}</h1><a className="btn primary scan-action" href={target}>Open Email →</a></div></main>;
 if(qr.type==="location"&&target.startsWith("geo:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">📍</div><h1>{qr.name}</h1><a className="btn primary scan-action" href={target}>Open Location →</a></div></main>;
 if(["video","image","audio","pdf","file","gallery"].includes(qr.type)){
  const url=String(qr.mediaUrl||qr.target||"");return <main className="media-view-page"><header className="media-view-top"><a href="/">Skan<span>Makery</span></a><span>SCAN</span></header><section className="media-view-card"><div className="media-view-badge">SkanMakery • {qr.type.toUpperCase()}</div><h1>{qr.name}</h1>{qr.type==="video"&&<video src={url} controls autoPlay playsInline className="media-view-video"/>}{qr.type==="image"&&<img src={url} className="media-view-image" alt={qr.name}/>} {qr.type==="audio"&&<audio src={url} controls autoPlay className="media-view-audio"/>}{qr.type==="pdf"&&<iframe src={url} className="media-view-pdf" title={qr.name}/>} {qr.type==="gallery"&&<div className="media-view-gallery"><img src={url} alt={qr.name}/></div>} {qr.type==="file"&&<div className="media-view-file"><div className="scan-icon">📦</div><h2>File ready</h2><a className="btn primary" href={url} download>Download file →</a></div>}<div className="media-view-footer">Created with SkanMakery</div></section></main>;
 }
 return <main className="scan-page"><div className="scan-card"><div className="scan-icon">✓</div><h1>{qr.name}</h1><div className="scan-value">{target}</div></div></main>;
}
