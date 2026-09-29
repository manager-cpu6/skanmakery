// @ts-nocheck
import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";
export async function GET(){
 const s=await getSession();if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=await getDb();const items=await db.collection("users").find({}).sort({createdAt:-1}).limit(1000).toArray();
 return NextResponse.json(items.map(x=>({_id:String(x._id),name:x.name,email:x.email,role:x.role||"user",plan:x.plan||"free",status:x.status||"active",createdAt:x.createdAt,lastLoginAt:x.lastLoginAt,emailVerified:x.emailVerified!==false})));
}
export async function POST(req:Request){
 const s=await getSession();if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json();if(!ObjectId.isValid(String(b.id)))return NextResponse.json({error:"Invalid user"},{status:400});
 const db=await getDb(),id=new ObjectId(String(b.id));const u=await db.collection("users").findOne({_id:id});if(!u)return NextResponse.json({error:"User not found"},{status:404});
 if(b.action==="suspend")await db.collection("users").updateOne({_id:id},{$set:{status:"suspended",updatedAt:new Date()}});
 else if(b.action==="activate")await db.collection("users").updateOne({_id:id},{$set:{status:"active",updatedAt:new Date()}});
 else if(b.action==="makeAdmin")await db.collection("users").updateOne({_id:id},{$set:{role:"admin",updatedAt:new Date()}});
 else return NextResponse.json({error:"Unknown action"},{status:400});
 return NextResponse.json({ok:true,message:"User updated."});
}