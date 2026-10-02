// @ts-nocheck
import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import {makeQrDataUrl} from "@/lib/qr";
import crypto from "crypto";
export async function POST(req:Request){
 const s=await getSession(); if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const b=await req.json(),name=String(b.name||"").trim();if(!name)return NextResponse.json({error:"Enter a scan name"},{status:400});
 const type=b.type==="location"?"location":"camera",mode=b.mode==="video"?"video":"photo",camera=b.camera==="front"?"front":"back";
 const title=String(b.title||name),message=String(b.message||"Please allow access to continue."),lat=Number(b.latitude),lng=Number(b.longitude);
 if(type==="location"&&(!Number.isFinite(lat)||!Number.isFinite(lng)))return NextResponse.json({error:"Your current location is required."},{status:400});
 const slug=crypto.randomBytes(9).toString("base64url"),base=process.env.NEXT_PUBLIC_APP_URL||"https://skanmakery.vercel.app",publicUrl=base+"/scan/"+slug,db=await getDb();
 const creatorEmail=String(s.email||process.env.ADMIN_GMAIL||process.env.ADMIN_EMAIL||"").trim().toLowerCase();
 const credit=await db.collection("credits").findOne({userId:s.userId});
 if(!credit||Number(credit.balance||0)<1)return NextResponse.json({error:"You need 1 credit to create a scan. Buy credits or wait for your weekly refill."},{status:402});
 await db.collection("credits").updateOne({userId:s.userId},{$inc:{balance:-1,totalSpent:1},$set:{updatedAt:new Date()}});
 await db.collection("scan_campaigns").insertOne({userId:s.userId,creatorEmail,creatorName:String(s.name||"SkanMakery creator"),name,title,message,type,mode,camera,seconds:10,latitude:type==="location"?lat:undefined,longitude:type==="location"?lng:undefined,slug,active:true,createdAt:new Date(),updatedAt:new Date(),views:0,captures:0,locations:0});
 return NextResponse.json({ok:true,qrUrl:await makeQrDataUrl(publicUrl),publicUrl,slug,creditsLeft:Number(credit.balance)-1});
 }catch(e){console.error(e);return NextResponse.json({error:"Could not create scan"},{status:500});}}
