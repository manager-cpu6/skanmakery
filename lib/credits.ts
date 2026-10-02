import {getDb} from "@/lib/mongodb";

export async function getCreditAccount(userId:string){
 const db=await getDb();
 let c:any=await db.collection("credits").findOne({userId});
 if(!c){
  c={userId,balance:25,weeklyGranted:25,lastGrantAt:new Date(),totalPurchased:0,totalSpent:0,initialGranted:true,weeklyEnabled:true,updatedAt:new Date()};
  await db.collection("credits").insertOne(c); return c;
 }
 if(c.initialGranted!==true){
  const now=new Date();
  await db.collection("credits").updateOne({userId},{$inc:{balance:25,weeklyGranted:25},$set:{initialGranted:true,weeklyEnabled:c.weeklyEnabled!==false,lastGrantAt:now,updatedAt:now}});
  c.balance=Number(c.balance||0)+25;c.weeklyGranted=Number(c.weeklyGranted||0)+25;c.initialGranted=true;c.lastGrantAt=now;
 }
 const days=(Date.now()-new Date(c.lastGrantAt||Date.now()).getTime())/86400000;
 if(c.weeklyEnabled!==false&&days>=7){
  const cycles=Math.floor(days/7);
  const next=new Date(new Date(c.lastGrantAt).getTime()+cycles*7*86400000);
  await db.collection("credits").updateOne({userId},{$inc:{balance:25*cycles,weeklyGranted:25*cycles},$set:{lastGrantAt:next,updatedAt:new Date()}});
  c.balance=Number(c.balance||0)+25*cycles;c.weeklyGranted=Number(c.weeklyGranted||0)+25*cycles;c.lastGrantAt=next;
 }
 return c;
}
export async function spendCredit(userId:string){
 const c=await getCreditAccount(userId);
 if(Number(c.balance||0)<1)return null;
 const db=await getDb();
 return db.collection("credits").findOneAndUpdate({userId,balance:{$gte:1}},{$inc:{balance:-1,totalSpent:1},$set:{updatedAt:new Date()}},{returnDocument:"after"});
}
