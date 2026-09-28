import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {sendMail,verificationEmail} from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req:Request){
 try{
  const {name,email,password}=await req.json();
  const normalized=String(email||"").trim().toLowerCase();
  if(!name||!normalized||!password||String(password).length<8)return NextResponse.json({error:"Name, email and an 8+ character password are required"},{status:400});
  const db=await getDb();
  if(await db.collection("users").findOne({email:normalized}))return NextResponse.json({error:"Email already registered. Try Sign in."},{status:409});
  const code=String(crypto.randomInt(100000,1000000));
  await db.collection("verification_codes").updateOne(
   {email:normalized,type:"signup"},
   {$set:{email:normalized,name:String(name).trim(),password:String(password),code,expiresAt:new Date(Date.now()+10*60*1000),createdAt:new Date()}},
   {upsert:true}
  );
  await sendMail(normalized,"Verify your SkanMakery account",verificationEmail(code));
  return NextResponse.json({ok:true});
 }catch(e){console.error(e);return NextResponse.json({error:"Could not send verification email. Check SMTP settings."},{status:500});}
}