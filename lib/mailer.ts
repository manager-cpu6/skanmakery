import nodemailer from "nodemailer";

function getSmtpConfig(){
 const host=String(process.env.SMTP_HOST||"mail.spacemail.com").trim();
 const port=Number(process.env.SMTP_PORT||465);
 const user=String(process.env.SMTP_USER||"").trim();
 const password=String(process.env.SMTP_PASSWORD||"");
 const from=String(process.env.SMTP_FROM||user).trim();
 if(!host||!user||!password||!from) {
  throw new Error("SMTP credentials are incomplete. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and SMTP_FROM.");
 }
 if(!Number.isFinite(port)||port<1||port>65535) throw new Error("SMTP_PORT is invalid.");
 return {host,port,user,password,from};
}

function transporter(){
 const c=getSmtpConfig();
 return nodemailer.createTransport({
  host:c.host,
  port:c.port,
  secure:c.port===465,
  auth:{user:c.user,password:c.password},
  connectionTimeout:15000,
  greetingTimeout:15000,
  socketTimeout:20000
 });
}

export async function sendMail(
 to:string,
 subject:string,
 html:string,
 attachments?:Array<{filename:string;content:Buffer;contentType?:string}>
){
 const c=getSmtpConfig();
 return transporter().sendMail({from:c.from,to,subject,html,attachments});
}

export function verificationEmail(code:string,title="Verify your SkanMakery account"){
 return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px">
 <h2>${title}</h2>
 <p>Your verification code is:</p>
 <div style="font-size:32px;font-weight:800;letter-spacing:8px;padding:18px;background:#f4f7fb;border-radius:14px;text-align:center">${code}</div>
 <p>This code expires in 10 minutes.</p>
 <p>If you did not request this, you can ignore this email.</p>
 </div>`;
}
