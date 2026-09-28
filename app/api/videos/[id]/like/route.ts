import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();if(!s)return NextResponse.json({error:"Login required"},{status:401});
 const {id}=await params;if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});
 const db=await getDb(),likes=db.collection("video_likes"),filter={videoId:id,userId:s.userId};
 const existing=await likes.findOne(filter);let liked=true;
 if(existing){await likes.deleteOne({_id:existing._id});liked=false;}else{await likes.insertOne({...filter,createdAt:new Date()});}
 const count=await likes.countDocuments({videoId:id});
 await db.collection("videos").updateOne({_id:new ObjectId(id)},{$set:{likes:count}});
 return NextResponse.json({likes:count,liked});
}
