import {NextResponse} from "next/server";
import {GridFSBucket} from "mongodb";
import {getDb} from "@/lib/mongodb";
import {getSession} from "@/lib/auth";

export const runtime="nodejs";
export async function POST(req:Request){
 const s=await getSession();
 if(!s||s.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const form=await req.formData();
  const file=form.get("file");
  const kind=String(form.get("kind")||"video");
  if(!(file instanceof File))return NextResponse.json({error:"File is required"},{status:400});
  if(file.size>80*1024*1024)return NextResponse.json({error:"Maximum file size is 80MB"},{status:413});
  const allowed=kind==="avatar"?["image/jpeg","image/png","image/webp"]:["video/mp4","video/webm","video/quicktime"];
  if(!allowed.includes(file.type))return NextResponse.json({error:"Unsupported file type"},{status:400});
  const db=await getDb(),bucket=new GridFSBucket(db,{bucketName:"media"});
  const stream=bucket.openUploadStream(file.name,{metadata:{kind,contentType:file.type,uploadedBy:s.userId}});
  const buf=Buffer.from(await file.arrayBuffer());
  await new Promise<void>((resolve,reject)=>{stream.once("finish",()=>resolve());stream.once("error",reject);stream.end(buf);});
  return NextResponse.json({ok:true,id:String(stream.id),url:"/api/media/"+String(stream.id),name:file.name,type:file.type,size:file.size});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Upload failed"},{status:500});}
}
