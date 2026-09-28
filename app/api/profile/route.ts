import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";
export async function GET(){
 const db=await getDb();
 const p=await db.collection("profile").findOne({_id:"main"});
 const followers=await db.collection("follows").countDocuments({profileId:"main"});
 const videos=await db.collection("videos").find({active:true}).sort({createdAt:-1}).toArray();
 const views=videos.reduce((n,v)=>n+(Number(v.views)||0),0);
 return NextResponse.json({username:"SkanMakery",displayName:"SkanMakery",bio:String(p?.bio||"Create • Share • Scan"),verified:true,avatarUrl:p?.avatarUrl||"",followers,following:0,videos:videos.map(v=>({...v,_id:String(v._id)})),views});
}
export async function POST(req:Request){
 const s=await getSession();if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json();const db=await getDb();
 await db.collection("profile").updateOne({_id:"main"},{$set:{displayName:String(b.displayName||"SkanMakery").slice(0,80),bio:String(b.bio||"").slice(0,200),avatarUrl:String(b.avatarUrl||"").trim(),updatedAt:new Date()}},{upsert:true});
 return NextResponse.json({ok:true});
}
