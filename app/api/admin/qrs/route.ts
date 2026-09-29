// @ts-nocheck
import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";
export async function GET(){
 const s=await getSession();if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=await getDb();const items=await db.collection("qrcodes").find({}).sort({createdAt:-1}).limit(1000).toArray();
 return NextResponse.json(items.map(x=>({...x,_id:String(x._id)})));
}
export async function DELETE(req:Request){
 const s=await getSession();if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json().catch(()=>({}));if(!ObjectId.isValid(String(b.id)))return NextResponse.json({error:"Invalid QR id"},{status:400});
 const db=await getDb();await db.collection("qrcodes").deleteOne({_id:new ObjectId(String(b.id))});return NextResponse.json({ok:true});
}