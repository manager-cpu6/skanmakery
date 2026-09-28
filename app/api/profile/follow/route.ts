import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";
export async function POST(){
 const s=await getSession();if(!s)return NextResponse.json({error:"Login required"},{status:401});
 const db=await getDb(),c=db.collection("follows"),filter={profileId:"main",userId:s.userId};
 const existing=await c.findOne(filter);let following=true;
 if(existing){await c.deleteOne({_id:existing._id});following=false;}else{await c.insertOne({...filter,createdAt:new Date()});}
 return NextResponse.json({following,followers:await c.countDocuments({profileId:"main"})});
}
