import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import {sendMail,verificationEmail} from "@/lib/mailer";

async function admin(){
  const s=await getSession();
  return s?.role==="admin";
}

export async function GET(){
  if(!(await admin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const db=await getDb();
  const pending=await db.collection("verification_codes").countDocuments({expiresAt:{$gt:new Date()}});
  return NextResponse.json({
    smtp:{
      host:!!process.env.SMTP_HOST,
      port:!!process.env.SMTP_PORT,
      user:!!process.env.SMTP_USER,
      password:!!process.env.SMTP_PASSWORD,
      from:!!(process.env.SMTP_FROM||process.env.SMTP_USER),
      portValue:process.env.SMTP_PORT||"465",
      hostValue:process.env.SMTP_HOST||"mail.spacemail.com",
      userValue:process.env.SMTP_USER||"",
      fromValue:process.env.SMTP_FROM||process.env.SMTP_USER||""
    },
    pending
  });
}

export async function POST(req:Request){
  if(!(await admin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const body=await req.json().catch(()=>({}));
    const action=String(body.action||"");
    const db=await getDb();

    if(action==="clear"){
      const result=await db.collection("verification_codes").deleteMany({});
      return NextResponse.json({ok:true,message:`Cleared ${result.deletedCount} pending verification codes.`});
    }

    if(action==="test"){
      const to=String(body.email||process.env.ADMIN_GMAIL||process.env.ADMIN_EMAIL||"").trim().toLowerCase();
      if(!to) return NextResponse.json({error:"Add ADMIN_GMAIL or provide a test email."},{status:400});
      const code="123456";
      await sendMail(to,"SkanMakery SMTP test",verificationEmail(code,"SkanMakery SMTP test"));
      return NextResponse.json({ok:true,message:`Test email sent to ${to}.`});
    }

    return NextResponse.json({error:"Unknown action"},{status:400});
  }catch(e){
    console.error("ADMIN_OTP_ERROR",e);
    const message=e instanceof Error?e.message:"SMTP test failed";
    return NextResponse.json({error:message},{status:500});
  }
}
