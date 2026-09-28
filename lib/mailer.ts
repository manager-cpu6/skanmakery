import nodemailer from "nodemailer";

function transporter(){
 const port=Number(process.env.SMTP_PORT||465);
 return nodemailer.createTransport({host:process.env.SMTP_HOST||"mail.spacemail.com",port,secure:port===465,auth:{user:process.env.SMTP_USER,password:process.env.SMTP_PASSWORD}});
}
export async function sendMail(to:string,subject:string,html:string,attachments?:Array<{filename:string,content:Buffer;contentType?:string}>){
 const from=process.env.SMTP_FROM||process.env.SMTP_USER;
 if(!from||!process.env.SMTP_PASSWORD) throw new Error("SMTP is not configured");
 return transporter().sendMail({from,to,subject,html,attachments});
}
export function verificationEmail(code:string,title="Verify your SkanMakery account"){
 return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px"><h2>${title}</h2><p>Your verification code is:</p><div style="font-size:32px;font-weight:800;letter-spacing:8px;padding:18px;background:#f4f7fb;border-radius:14px;text-align:center">${code}</div><p>This code expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p></div>`;
}