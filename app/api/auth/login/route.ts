import {NextResponse} from "next/server";import bcrypt from "bcryptjs";import {getDb} from "@/lib/mongodb";import {createSession} from "@/lib/auth";
export async function POST(req:Request){
 try{
  const {email,password}=await req.json();const normalized=String(email||"").trim().toLowerCase();
  const adminEmail=String(process.env.ADMIN_GMAIL||process.env.ADMIN_EMAIL||"").trim().toLowerCase();
  if(adminEmail&&normalized===adminEmail&&String(password||"")===String(process.env.ADMIN_PASSWORD||"")){
   await createSession({userId:"admin",email:adminEmail,name:"Admin",role:"admin"});return NextResponse.json({ok:true,role:"admin"});
  }
  const db=await getDb();const u=await db.collection("users").findOne({email:normalized});
  if(!u||!(await bcrypt.compare(String(password||""),u.passwordHash)))return NextResponse.json({error:"Invalid email or password"},{status:401});
  if(u.status==="suspended")return NextResponse.json({error:"Account suspended"},{status:403});
  if(u.emailVerified===false)return NextResponse.json({error:"Please verify your email first."},{status:403});
  const role=u.role==="admin"?"admin":"user";await createSession({userId:u._id.toString(),email:u.email,name:u.name,role});await db.collection("users").updateOne({_id:u._id},{$set:{lastLoginAt:new Date()}});
  return NextResponse.json({ok:true,role});
 }catch(e){console.error(e);return NextResponse.json({error:"Server error"},{status:500});}
}