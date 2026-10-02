import {notFound} from "next/navigation";
import bwipjs from "bwip-js";
import {getDb} from "@/lib/mongodb";
export default async function BarcodePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const db=await getDb();const b=await db.collection("barcodes").findOne({slug});if(!b)notFound();
 const png=await bwipjs.toBuffer({bcid:b.format||"code128",text:b.value,scale:4,height:18,includetext:true,textxalign:"center",backgroundcolor:"FFFFFF",paddingwidth:12,paddingheight:12});
 const src="data:image/png;base64,"+Buffer.from(png).toString("base64");
 return <main className="media-view-page"><header className="media-view-top"><a href="/">Skan<span>Makery</span></a><span>BARCODE</span></header><section className="media-view-card barcode-public-card"><div className="media-view-badge">SkanMakery • BARCODE</div><h1>{b.name}</h1><img src={src} className="barcode-image" alt={b.name}/><p className="barcode-value">{b.value}</p><div className="media-view-footer">Scan this barcode with a compatible scanner.</div></section></main>;
}