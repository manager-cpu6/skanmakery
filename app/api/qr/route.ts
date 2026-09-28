import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import {makeTarget,makeQrDataUrl} from "@/lib/qr";
import crypto from "crypto";

export async function POST(req:Request){
 const s=await getSession(); if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json();
  const {name,type,value,phone,wifiSsid,wifiPassword,wifiSecurity,wifiHidden,paymentCountry,paymentProvider,paymentPrefix,paymentMode,paymentCurrency}=body;
  if(!name||!type)return NextResponse.json({error:"Missing fields"},{status:400});
  const form:any={url:value,text:value,phone:value,email:value,whatsapp:value,ssid:wifiSsid||value,password:wifiPassword||"",security:wifiSecurity||"WPA",hidden:String(Boolean(wifiHidden))};
  if(type==="phone")form.phone=phone||value||"";
  if(type==="wifi"){
   if(!String(wifiSsid||"").trim())return NextResponse.json({error:"Enter the Wi-Fi network name (SSID)"},{status:400});
   if(String(wifiSecurity||"WPA")!=="nopass"&&!String(wifiPassword||"").trim())return NextResponse.json({error:"Enter the Wi-Fi password"},{status:400});
  }
  if(type==="ussd"){
   const n=String(phone||"").replace(/\D/g,""),prefix=String(paymentPrefix||"").trim();
   if(!paymentCountry||!paymentProvider||!prefix||!n)return NextResponse.json({error:"Choose country, provider and enter the customer number"},{status:400});
  }
  if(type==="url"&&!value)return NextResponse.json({error:"Enter a website URL"},{status:400});
  if(type==="phone"&&!form.phone)return NextResponse.json({error:"Enter a phone number"},{status:400});
  const slug=crypto.randomBytes(5).toString("base64url");
  const base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";
  const qrUrl=base+"/q/"+slug,db=await getDb();
  const target=type==="ussd"?"ussd-payment":makeTarget(type,form);
  const qrPayload=type==="wifi"?target:qrUrl;
  await db.collection("qrcodes").insertOne({
   userId:s.userId,name,type,slug,target,qrUrl,qrPayload,active:true,scanCount:0,
   wifiSsid:type==="wifi"?String(wifiSsid||""):undefined,
   wifiSecurity:type==="wifi"?String(wifiSecurity||"WPA"):undefined,
   wifiHidden:type==="wifi"?Boolean(wifiHidden):undefined,
   paymentCountry:type==="ussd"?paymentCountry:undefined,paymentProvider:type==="ussd"?paymentProvider:undefined,
   paymentPrefix:type==="ussd"?paymentPrefix:undefined,paymentMode:type==="ussd"?(paymentMode||"menu"):undefined,
   currency:type==="ussd"?paymentCurrency:undefined,paymentNumber:type==="ussd"?String(phone||"").replace(/\D/g,""):undefined,
   createdAt:new Date(),updatedAt:new Date()
  });
  return NextResponse.json({ok:true,qrUrl:await makeQrDataUrl(qrPayload),publicUrl:qrUrl,payloadType:type==="wifi"?"wifi":"dynamic"});
 }catch(e){return NextResponse.json({error:"Could not create QR"},{status:500});}
}