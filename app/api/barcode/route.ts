// @ts-nocheck
import {NextResponse} from "next/server";
import bwipjs from "bwip-js";
import crypto from "crypto";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
export async function POST(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await req.json(),name=String(b.name||"").trim(),value=String(b.value||"").trim(),format=String(b.format||"code128");
  if(!name||!value)return NextResponse.json({error:"Enter a barcode name and value."},{status:400});
  const allowed=["code128","ean13","upca","code39","itf14"];
  const bcid=allowed.includes(format)?format:"code128";
  if(["ean13","upca","itf14"].includes(bcid)&&!/^[0-9]+$/.test(value))return NextResponse.json({error:"This barcode format requires numbers only."},{status:400});
  const png=await bwipjs.toBuffer({bcid,text:value,scale:4,height:18,includetext:true,textxalign:"center",backgroundcolor:"FFFFFF",paddingwidth:12,paddingheight:12});
  const base=process.env.NEXT_PUBLIC_APP_URL||"https://skanmakery.vercel.app",slug=crypto.randomBytes(5).toString("base64url"),db=await getDb();
  await db.collection("barcodes").insertOne({userId:s.userId,name,value,format:bcid,createdAt:new Date(),slug});
  return NextResponse.json({ok:true,image:"data:image/png;base64,"+Buffer.from(png).toString("base64"),publicUrl:base+"/barcode/"+slug,slug});
 }catch(e){console.error(e);return NextResponse.json({error:"Could not create barcode."},{status:500});}
}