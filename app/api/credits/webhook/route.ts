// @ts-nocheck
import {NextResponse} from "next/server";
import crypto from "crypto";
import {getDb} from "@/lib/mongodb";

export async function POST(req:Request){
 try{
  const raw=await req.text();
  const payload=JSON.parse(raw);
  const sign=String(payload?.sign||"");
  if(!sign)return NextResponse.json({error:"Missing signature"},{status:401});
  const {sign:_,...unsigned}=payload;
  const key=String(process.env.CRYPTOMUS_PAYMENT_API_KEY||"");
  const expected=crypto.createHash("md5").update(Buffer.from(JSON.stringify(unsigned)).toString("base64")+key).digest("hex");
  if(!crypto.timingSafeEqual(Buffer.from(sign),Buffer.from(expected)))return NextResponse.json({error:"Invalid signature"},{status:401});

  const db=await getDb();
  const order=await db.collection("credit_orders").findOne({$or:[{orderId:payload.order_id},{uuid:payload.uuid}]});
  if(!order)return NextResponse.json({ok:true});

  if(["paid","paid_over"].includes(String(payload.status))&&!order.credited){
   await db.collection("credits").updateOne(
    {userId:order.userId},
    {$inc:{balance:Number(order.credits||0),totalPurchased:Number(order.credits||0)},$set:{updatedAt:new Date(),initialGranted:true,weeklyEnabled:true,lastGrantAt:new Date()}},
    {upsert:true}
   );
   await db.collection("credit_orders").updateOne(
    {_id:order._id,credited:{$ne:true}},
    {$set:{credited:true,status:payload.status,paidAt:new Date(),updatedAt:new Date(),paymentAmount:payload.payment_amount,payerCurrency:payload.payer_currency,txid:payload.txid||""}}
   );
  }else{
   await db.collection("credit_orders").updateOne({_id:order._id},{$set:{status:payload.status,updatedAt:new Date()}});
  }
  return NextResponse.json({ok:true});
 }catch(e){
  console.error("Cryptomus webhook error",e);
  return NextResponse.json({error:"Webhook failed"},{status:500});
 }
}