import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();
 if(!s)return NextResponse.json({error:"Login required"},{status:401});
 const {id}=await params;
 if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});
 const db=await getDb(),videos=db.collection("videos"),likes=db.collection("video_likes");
 const video=await videos.findOne({_id:new ObjectId(id),active:true});
 if(!video)return NextResponse.json({error:"Video not found"},{status:404});

 let base=Number(video.baseLikes);
 if(!Number.isFinite(base)){base=Math.max(0,Number(video.likes)||0);await videos.updateOne({_id:new ObjectId(id)},{$set:{baseLikes:base}});}
 const filter={videoId:id,userId:s.userId};
 const existing=await likes.findOne(filter);
 let liked=true;
 if(existing){await likes.deleteOne({_id:existing._id});liked=false;}
 else{await likes.insertOne({...filter,createdAt:new Date()});}
 const userLikes=await likes.countDocuments({videoId:id});
 const total=base+userLikes;
 await videos.updateOne({_id:new ObjectId(id)},{$set:{likes:total}});
 return NextResponse.json({likes:total,liked});
}
