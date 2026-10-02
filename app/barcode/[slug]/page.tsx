// @ts-nocheck
import {notFound} from "next/navigation";
import bwipjs from "bwip-js";
import {getDb} from "@/lib/mongodb";
export default async function BarcodePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const db=await getDb();const b=await db.collection("barcodes").findOne({slug});if(!b)notFound();
 const png=await bwipjs.toBuffer({bcid:b.format||"code128",text:b.value,scale:4,height:18,includetext:true,textxalign:"center",backgroundcolor:"FFFFFF",paddingwidth:12,paddingheight:12});
 const src="data:image/png;base64,"+Buffer.from(png).toString("base64");
 return <main className="media-view-page"><header className="media-view-top"><a href="/">Skan<span>Makery</span></a><span>BARCODE</span></header><section className="media-view-card barcode-public-card"><div className="media-view-badge">SkanMakery • BARCODE</div><h1>{b.name}</h1><img src={src} className="barcode-image" alt={b.name}/><div className="barcode-value-box"><span>BARCODE CONTENT</span><strong>{b.value}</strong><small>{String(b.format||"code128").toUpperCase()}</small></div><div className="barcode-actions"><button className="btn primary" onClick={()=>window.print()}>🖨 Print barcode</button><a className="btn light" href={src} download={b.name+"-barcode.png"}>Download PNG</a></div><div className="media-view-footer">This is a real machine-readable barcode. The value above is the exact data encoded in it.</div></section></main>;
}