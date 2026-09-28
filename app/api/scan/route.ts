import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import {makeQrDataUrl} from "@/lib/qr";
import crypto from "crypto";

export async function POST(req:Request){
 const s=await getSession();
 if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json();
  const name=String(body.name||"").trim();
  const title=String(body.title||name||"Camera capture").trim();
  const message=String(body.message||"Allow camera access to continue.").trim();
  const mode=body.mode==="video"?"video":"photo";
  const camera=body.camera==="front"?"front":"back";
  const seconds=Math.min(60,Math.max(3,Number(body.seconds)||10));
  if(!name)return NextResponse.json({error:"Enter a QR name"},{status:400});
  if(!message)return NextResponse.json({error:"Add a clear permission message"},{status:400});
  const slug=crypto.randomBytes(8).toString("base64url");
  const base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";
  const publicUrl=base+"/scan/"+slug;
  const db=await getDb();
  await db.collection("scan_campaigns").insertOne({
   userId:s.userId,name,title,message,mode,camera,seconds,slug,active:true,
   createdAt:new Date(),updatedAt:new Date()
  });
  const qrUrl=await makeQrDataUrl(publicUrl);
  return NextResponse.json({ok:true,qrUrl,publicUrl,slug});
 }catch{
  return NextResponse.json({error:"Could not create camera QR"},{status:500});
 }
}
