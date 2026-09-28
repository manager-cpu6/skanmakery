import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();
 if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});
 const b=await req.json();
 const update:any={updatedAt:new Date()};
 for(const k of ["title","caption","videoUrl","thumbnailUrl","active"])if(b[k]!==undefined)update[k]=b[k];
 for(const k of ["likes","views","shares"])if(b[k]!==undefined)update[k]=Math.max(0,Number(b[k])||0);
 const db=await getDb();
 await db.collection("videos").updateOne({_id:new ObjectId(id)},{$set:update});
 return NextResponse.json({ok:true});
}

export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();
 if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});
 const db=await getDb();
 await db.collection("videos").deleteOne({_id:new ObjectId(id)});
 return NextResponse.json({ok:true});
}
