// @ts-nocheck
import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";

export async function GET(){
 const db=await getDb();
 const videos=await db.collection("videos").find({active:true}).sort({createdAt:-1}).limit(100).toArray();
 const likes= db.collection("video_likes");
 const out=await Promise.all(videos.map(async v=>{
  const base=Number(v.baseLikes ?? v.likes ?? 0);
  const userLikes=await likes.countDocuments({videoId:String(v._id)});
  return {...v,_id:String(v._id),likes:base+userLikes,baseLikes:base};
 }));
 return NextResponse.json(out);
}

export async function POST(req:Request){
 const s=await getSession();
 if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await req.json();
  if(!b.title||!b.videoUrl)return NextResponse.json({error:"Title and video URL are required"},{status:400});
  const baseLikes=Math.max(0,Number(b.likes)||0);
  const doc={
   title:String(b.title).slice(0,160),
   caption:String(b.caption||"").slice(0,1000),
   videoUrl:String(b.videoUrl).trim(),
   thumbnailUrl:String(b.thumbnailUrl||"").trim(),
   baseLikes,
   likes:baseLikes,
   views:Math.max(0,Number(b.views)||0),
   comments:[],
   shares:0,
   active:b.active!==false,
   createdAt:new Date(),
   updatedAt:new Date()
  };
  const db=await getDb(),r=await db.collection("videos").insertOne(doc);
  return NextResponse.json({ok:true,id:String(r.insertedId)});
 }catch{return NextResponse.json({error:"Could not create video"},{status:500});}
}
