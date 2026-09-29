import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";

export async function POST(req:Request){
 const s=await getSession();
 if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await req.json();
  const db=await getDb();
  const p=await db.collection("profile").findOne({profileId:"main"});
  let followers=Math.max(0,Number(p?.followerBase||0));
  let following=Math.max(0,Number(p?.followingBase||0));
  if(b.setFollowers!==undefined)followers=Math.max(0,Number(b.setFollowers)||0);
  if(b.setFollowing!==undefined)following=Math.max(0,Number(b.setFollowing)||0);
  if(b.addFollowers!==undefined)followers=Math.max(0,followers+(Number(b.addFollowers)||0));
  if(b.addFollowing!==undefined)following=Math.max(0,following+(Number(b.addFollowing)||0));
  await db.collection("profile").updateOne({profileId:"main"},{$set:{followerBase:followers,followingBase:following,updatedAt:new Date()}},{upsert:true});
  const realFollowers=await db.collection("follows").countDocuments({profileId:"main"});
  return NextResponse.json({ok:true,followers:followers+realFollowers,following});
 }catch{return NextResponse.json({error:"Could not update profile stats"},{status:500});}
}