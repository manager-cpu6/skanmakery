// @ts-nocheck
import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";

export async function POST(req:Request){
 const s=await getSession();
 if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json();
 const id=String(b.id||"");
 const amount=Math.max(1,Math.min(100000,Number(b.amount)||1));
 if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});
 const db=await getDb();
 const video=await db.collection("videos").findOne({_id:new ObjectId(id)});
 if(!video)return NextResponse.json({error:"Video not found"},{status:404});
 const currentBase=Number(video.baseLikes);
 const base=Number.isFinite(currentBase)?currentBase:Math.max(0,Number(video.likes)||0);
 const userLikes=await db.collection("video_likes").countDocuments({videoId:id});
 const nextBase=base+amount;
 const total=nextBase+userLikes;
 await db.collection("videos").updateOne({_id:new ObjectId(id)},{$set:{baseLikes:nextBase,likes:total,updatedAt:new Date()}});
 return NextResponse.json({likes:total,baseLikes:nextBase,userLikes});
}
