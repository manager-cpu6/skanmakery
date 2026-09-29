// @ts-nocheck
import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import {ObjectId} from "mongodb";
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const db=await getDb();const q=s.role==="admin"?{}:{userId:s.userId};const items=await db.collection("scan_campaigns").find(q).sort({createdAt:-1}).limit(500).toArray();return NextResponse.json(items.map(x=>({...x,_id:String(x._id)})));}
export async function DELETE(req:Request){const s=await getSession();if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});const b=await req.json().catch(()=>({}));const db=await getDb();if(b.all===true){const r=await db.collection("scan_campaigns").deleteMany({});return NextResponse.json({ok:true,deleted:r.deletedCount});}const id=String(b.id||"");if(!ObjectId.isValid(id))return NextResponse.json({error:"Invalid id"},{status:400});await db.collection("scan_campaigns").deleteOne({_id:new ObjectId(id)});return NextResponse.json({ok:true});}