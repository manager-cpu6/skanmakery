// @ts-nocheck
import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import {getCreditAccount} from "@/lib/credits";
async function guard(){const s=await getSession();return s&&s.role==="admin"?s:null}
export async function GET(req:Request){
 const s=await guard();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 const db=await getDb(),url=new URL(req.url),q=String(url.searchParams.get("q")||"").trim();
 const users=await db.collection("users").find(q?{$or:[{email:{$regex:q,$options:"i"}},{name:{$regex:q,$options:"i"}}]}:{}).sort({createdAt:-1}).limit(1000).toArray();
 const credits=await db.collection("credits").find({userId:{$in:users.map(u=>String(u._id))}}).toArray(),cm=new Map(credits.map(c=>[String(c.userId),c]));
 const items=users.map(u=>{const c=cm.get(String(u._id));return {_id:String(u._id),name:u.name||"",email:u.email||"",role:u.role||"user",status:u.status||"active",plan:u.plan||"free",balance:Number(c?.balance||0),weeklyGranted:Number(c?.weeklyGranted||0),weeklyEnabled:c?.weeklyEnabled!==false,totalPurchased:Number(c?.totalPurchased||0),totalSpent:Number(c?.totalSpent||0),lastGrantAt:c?.lastGrantAt||null,updatedAt:c?.updatedAt||null}});
 const orders=await db.collection("credit_orders").find({}).sort({createdAt:-1}).limit(200).toArray();
 const totals=(await db.collection("credits").aggregate([{$group:{_id:null,balance:{$sum:{$ifNull:["$balance",0]}},purchased:{$sum:{$ifNull:["$totalPurchased",0]}},spent:{$sum:{$ifNull:["$totalSpent",0]}}}}]).toArray())[0]||{};
 return NextResponse.json({users:items,orders:orders.map(o=>({id:String(o._id),orderId:o.orderId,userId:String(o.userId),pack:o.pack,credits:Number(o.credits||0),amount:o.amount,status:o.status,credited:!!o.credited,createdAt:o.createdAt,paidAt:o.paidAt,txid:o.txid||""})),totals});
}
export async function POST(req:Request){
 const s=await guard();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json(),userId=String(b.userId||"");if(!ObjectId.isValid(userId))return NextResponse.json({error:"Invalid user"},{status:400});
 const action=String(b.action||""),amount=Math.max(0,Math.floor(Number(b.amount||0))),db=await getDb(),c=await getCreditAccount(userId),before=Number(c.balance||0);
 if(["grant","remove","set"].includes(action)){
  if(action!=="set"&&amount<1)return NextResponse.json({error:"Enter a positive amount"},{status:400});
  const after=action==="set"?amount:Math.max(0,before+(action==="grant"?amount:-amount));
  await db.collection("credits").updateOne({userId},{$set:{balance:after,initialGranted:true,updatedAt:new Date()},$inc:{adminAdjusted:after-before}});
  await db.collection("credit_ledger").insertOne({userId,action,amount:action==="set"?after:amount,before,after,adminId:s.userId,createdAt:new Date()});
  return NextResponse.json({ok:true,balance:after});
 }
 if(action==="weekly"){const enabled=Boolean(b.enabled);await db.collection("credits").updateOne({userId},{$set:{weeklyEnabled:enabled,initialGranted:true,updatedAt:new Date()}});return NextResponse.json({ok:true,weeklyEnabled:enabled});}
 if(action==="grantWeekly"){const after=before+25;await db.collection("credits").updateOne({userId},{$inc:{balance:25,weeklyGranted:25},$set:{lastGrantAt:new Date(),initialGranted:true,updatedAt:new Date()}});await db.collection("credit_ledger").insertOne({userId,action,amount:25,before,after,adminId:s.userId,createdAt:new Date()});return NextResponse.json({ok:true,balance:after});}
 if(action==="reset"){await db.collection("credits").updateOne({userId},{$set:{balance:0,initialGranted:true,updatedAt:new Date()}});await db.collection("credit_ledger").insertOne({userId,action,amount:0,before,after:0,adminId:s.userId,createdAt:new Date()});return NextResponse.json({ok:true,balance:0});}
 return NextResponse.json({error:"Unknown action"},{status:400});
}
