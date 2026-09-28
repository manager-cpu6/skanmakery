import {notFound,redirect} from "next/navigation";
import {getDb} from "@/lib/mongodb";
function isExternalUrl(value:string){try{const u=new URL(value);return u.protocol==="http:"||u.protocol==="https:"}catch{return false}}
export default async function QRView({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const db=await getDb(); const qr=await db.collection("qrcodes").findOne({slug,active:true}); if(!qr)notFound();
 await db.collection("qrcodes").updateOne({_id:qr._id},{$inc:{scanCount:1}});
 const target=String(qr.target||"");
 if(qr.type==="url"&&isExternalUrl(target))redirect(target);
 if((qr.type==="phone"||qr.type==="ussd")&&target.startsWith("tel:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">📞</div><h1>{qr.name}</h1><p>Phone action is ready.</p><a className="btn primary scan-action" href={target}>Open Phone →</a><p className="scan-hint">If your phone does not open automatically, tap the button above.</p></div></main>;
 if(qr.type==="whatsapp"&&target.startsWith("http"))redirect(target);
 if(qr.type==="email"&&target.startsWith("mailto:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">✉️</div><h1>{qr.name}</h1><a className="btn primary scan-action" href={target}>Open Email →</a></div></main>;
 if(qr.type==="location"&&target.startsWith("geo:"))return <main className="scan-page"><div className="scan-card"><div className="scan-icon">📍</div><h1>{qr.name}</h1><a className="btn primary scan-action" href={target}>Open Location →</a></div></main>;
 return <main className="scan-page"><div className="scan-card"><div className="scan-icon">✓</div><h1>{qr.name}</h1><div className="scan-value">{target}</div></div></main>;
}