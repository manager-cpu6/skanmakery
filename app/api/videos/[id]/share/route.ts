import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});
 const db=await getDb();const r=await db.collection("videos").findOneAndUpdate({_id:new ObjectId(id),active:true},{$inc:{shares:1}},{returnDocument:"after"});
 return NextResponse.json({shares:r?.shares??0});
}
