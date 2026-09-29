import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";

export async function GET(){
 const db=await getDb();
 const p=await db.collection("profile").findOne({profileId:"main"});
 const realFollowers=await db.collection("follows").countDocuments({profileId:"main"});
 const baseFollowers=Math.max(0,Number(p?.followerBase||0));
 const following=Math.max(0,Number(p?.followingBase||0));
 const videos=await db.collection("videos").find({active:true}).sort({createdAt:-1}).toArray();
 const likes=await db.collection("video_likes");
 const mapped=await Promise.all(videos.map(async v=>{
  const base=Number(v.baseLikes ?? v.likes ?? 0);
  const userLikes=await likes.countDocuments({videoId:String(v._id)});
  return {...v,_id:String(v._id),likes:base+userLikes};
 }));
 const views=mapped.reduce((n,v)=>n+(Number(v.views)||0),0);
 return NextResponse.json({
  username:String(p?.username||"SkanMakery"),
  displayName:String(p?.displayName||"SkanMakery"),
  bio:String(p?.bio||"Create • Share • Scan"),
  verified:p?.verified!==false,
  avatarUrl:p?.avatarUrl||"",
  followers:baseFollowers+realFollowers,
  following,
  videos:mapped,
  views
 });
}

export async function POST(req:Request){
 const s=await getSession();
 if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json();const db=await getDb();
 await db.collection("profile").updateOne(
  {profileId:"main"},
  {$set:{
   username:String(b.username||"SkanMakery").replace(/^@/,"").slice(0,40),
   displayName:String(b.displayName||"SkanMakery").slice(0,80),
   bio:String(b.bio||"").slice(0,200),
   avatarUrl:String(b.avatarUrl||"").trim(),
   verified:b.verified!==false,
   updatedAt:new Date()
  }},
  {upsert:true}
 );
 return NextResponse.json({ok:true});
}
