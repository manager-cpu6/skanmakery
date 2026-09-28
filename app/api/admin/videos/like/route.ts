import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";
export async function POST(req:Request){
 const s=await getSession();if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json();const id=String(b.id||"");const amount=Math.max(1,Math.min(100000,Number(b.amount)||1));
 if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});
 const db=await getDb(),r=await db.collection("videos").findOneAndUpdate({_id:new ObjectId(id)},{$inc:{likes:amount}},{returnDocument:"after"});
 return NextResponse.json({likes:r?.likes??0});
}
