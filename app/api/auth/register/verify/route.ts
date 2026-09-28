import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {getDb} from "@/lib/mongodb";
import {createSession} from "@/lib/auth";
export async function POST(req:Request){
 try{
  const {email,code}=await req.json();const normalized=String(email||"").trim().toLowerCase();
  const db=await getDb();const v=await db.collection("verification_codes").findOne({email:normalized,type:"signup"});
  if(!v||v.code!==String(code||"")||new Date(v.expiresAt)<new Date())return NextResponse.json({error:"Invalid or expired verification code"},{status:400});
  if(await db.collection("users").findOne({email:normalized}))return NextResponse.json({error:"Email already registered"},{status:409});
  const result=await db.collection("users").insertOne({name:v.name,email:normalized,passwordHash:await bcrypt.hash(v.password,12),role:"user",plan:"free",status:"active",emailVerified:true,createdAt:new Date(),updatedAt:new Date()});
  await db.collection("verification_codes").deleteOne({_id:v._id});
  await createSession({userId:result.insertedId.toString(),email:normalized,name:v.name,role:"user"});
  return NextResponse.json({ok:true});
 }catch(e){console.error(e);return NextResponse.json({error:"Server error"},{status:500});}
}