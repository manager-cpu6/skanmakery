import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});
 const b=await req.json(),text=String(b.text||"").trim(),name=String(b.name||"Guest").trim().slice(0,40);
 if(!text)return NextResponse.json({error:"Comment is required"},{status:400});
 const item={id:new ObjectId().toString(),name:name||"Guest",text:text.slice(0,500),createdAt:new Date()};
 const db=await getDb();await db.collection("videos").updateOne({_id:new ObjectId(id),active:true},{$push:{comments:item} as any});
 return NextResponse.json({ok:true});
}
