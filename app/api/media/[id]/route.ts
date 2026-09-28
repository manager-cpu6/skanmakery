import {NextResponse} from "next/server";
import {GridFSBucket,ObjectId} from "mongodb";
import {getDb} from "@/lib/mongodb";
export const runtime="nodejs";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!ObjectId.isValid(id))return new NextResponse("Invalid media id",{status:400});
 const db=await getDb(),bucket=new GridFSBucket(db,{bucketName:"media"});
 const file=await db.collection("media.files").findOne({_id:new ObjectId(id)});
 if(!file)return new NextResponse("Not found",{status:404});
 const stream=bucket.openDownloadStream(new ObjectId(id));
 const body=stream as unknown as ReadableStream;
 return new Response(body,{headers:{"Content-Type":String(file.metadata?.contentType||"application/octet-stream"),"Content-Length":String(file.length||0),"Cache-Control":"public, max-age=31536000, immutable"}});
}
