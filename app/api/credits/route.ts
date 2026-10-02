// @ts-nocheck
import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getCreditAccount} from "@/lib/credits";
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const c=await getCreditAccount(s.userId);return NextResponse.json({balance:Number(c.balance||0),weeklyGrant:25,weeklyEnabled:c.weeklyEnabled!==false,nextGrantAt:new Date(new Date(c.lastGrantAt).getTime()+7*86400000).toISOString(),totalPurchased:Number(c.totalPurchased||0),totalSpent:Number(c.totalSpent||0)});}
