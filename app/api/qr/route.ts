import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import {makeTarget,makeQrDataUrl} from "@/lib/qr";
import crypto from "crypto";
export async function POST(req:Request){
 const s=await getSession(); if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json(); const {name,type,value,phone,ussdPrefix,amount}=body;
  if(!name||!type)return NextResponse.json({error:"Missing fields"},{status:400});
  let form:any={url:value,text:value,phone:value,email:value,whatsapp:value,ssid:value};
  if(type==="phone")form.phone=phone||value||"";
  if(type==="ussd"){const n=String(phone||"").replace(/\D/g,""),a=String(amount||"").replace(/[^\d.]/g,"");if(!ussdPrefix||!n||!a)return NextResponse.json({error:"Enter USSD code, phone number and amount"},{status:400});form.phone=ussdPrefix+n+"*"+a+"#";}
  if(type==="url"&&!value)return NextResponse.json({error:"Enter a website URL"},{status:400});
  if(type==="phone"&&!form.phone)return NextResponse.json({error:"Enter a phone number"},{status:400});
  const slug=crypto.randomBytes(5).toString("base64url"),base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000",qrUrl=base+"/q/"+slug;
  const target=makeTarget(type==="ussd"?"phone":type,form),db=await getDb();
  await db.collection("qrcodes").insertOne({userId:s.userId,name,type,slug,target,qrUrl,active:true,scanCount:0,createdAt:new Date(),updatedAt:new Date()});
  return NextResponse.json({ok:true,qrUrl:await makeQrDataUrl(qrUrl),publicUrl:qrUrl});
 }catch(e){return NextResponse.json({error:"Could not create QR"},{status:500})}
}