"use client";
import {useEffect,useRef,useState} from "react";

type Mode="photo"|"video";
type Video={_id:string;title:string;caption:string;videoUrl:string;thumbnailUrl?:string;likes:number;views:number;shares:number};

export default function CameraPrank({params}:{params:Promise<{slug:string}>}){
 const [cfg,setCfg]=useState<any>(null),[feed,setFeed]=useState<Video[]>([]),[mode,setMode]=useState<Mode>("video"),[seconds,setSeconds]=useState(10);
 const [stage,setStage]=useState<"choose"|"permission"|"feed"|"capturing"|"done">("choose"),[error,setError]=useState(""),[uploading,setUploading]=useState(false);
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),chunks=useRef<Blob[]>([]),slug=useRef("");

 useEffect(()=>{
  params.then(p=>{
   slug.current=p.slug;
   fetch("/api/scan/"+p.slug).then(r=>r.ok?r.json():Promise.reject()).then(c=>{setCfg(c);setMode(c.mode==="photo"?"photo":"video");setSeconds(Math.min(60,Math.max(5,Number(c.seconds)||10)));}).catch(()=>setError("This Video Recorder Scan is not available."));
   fetch("/api/videos").then(r=>r.ok?r.json():[]).then(setFeed).catch(()=>{});
  });
  return()=>stream.current?.getTracks().forEach(t=>t.stop());
 },[]);

 const openCamera=async()=>{
  setError("");
  try{
   const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:cfg?.camera==="front"?"user":"environment"},audio:mode==="video"});
   stream.current=s;
   setStage("feed");
  }catch{setError("Camera permission was not granted. Please choose Allow in your browser.");}
 };

 useEffect(()=>{
  if(stage!=="feed"&&stage!=="capturing")return;
  if(!stream.current||!video.current)return;
  video.current.srcObject=stream.current;
  video.current.play().catch(()=>{});
 },[stage]);

 const stopTracks=()=>stream.current?.getTracks().forEach(t=>t.stop());

 const uploadCapture=async(blob:Blob,filename:string)=>{
  setUploading(true);
  try{
   const fd=new FormData();fd.append("file",new File([blob],filename,{type:blob.type||"application/octet-stream"}));
   const r=await fetch("/api/scan/"+slug.current,{method:"POST",body:fd});
   if(!r.ok){const x=await r.json().catch(()=>({}));throw new Error(x.error||"Capture could not be sent.");}
   setStage("done");
  }catch(e){setError(e instanceof Error?e.message:"Capture could not be sent.");setStage("feed");}
  finally{setUploading(false);}
 };

 const startCapture=()=>{
  setError("");
  if(!stream.current)return;
  setStage("capturing");
  if(mode==="photo"){
   const c=document.createElement("canvas"),v=video.current;
   if(!v)return;
   c.width=v.videoWidth||720;c.height=v.videoHeight||1280;c.getContext("2d")?.drawImage(v,0,0,c.width,c.height);
   c.toBlob(b=>{if(b)uploadCapture(b,"capture.jpg");},"image/jpeg",.92);
   stopTracks();
   return;
  }
  try{
   const options=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));
   const mr=new MediaRecorder(stream.current,options?{mimeType:options}:undefined);
   chunks.current=[];rec.current=mr;
   mr.ondataavailable=e=>e.data.size&&chunks.current.push(e.data);
   mr.onstop=()=>{const blob=new Blob(chunks.current,{type:mr.mimeType||"video/webm"});stopTracks();uploadCapture(blob,"capture.webm");};
   mr.start();
   window.setTimeout(()=>{if(mr.state==="recording")mr.stop();},seconds*1000);
  }catch{setError("This browser cannot record video. Please try Chrome or another modern browser.");setStage("feed");}
 };

 const finish=()=>{stopTracks();location.href="/";};

 if(error&&!cfg)return <main className="scan-camera-page"><div className="scan-camera-card"><b>Video Recorder Scan</b><h1>{error}</h1></div></main>;
 if(!cfg)return <main className="scan-camera-page"><div className="scan-camera-card">Loading Video Recorder Scan…</div></main>;

 if(stage==="choose")return <main className="scan-camera-page"><div className="scan-camera-card">
  <div className="scan-camera-brand">Skan<span>Makery</span></div><div className="scan-camera-icon">▣</div>
  <div className="scan-camera-pill">VIDEO RECORDER SCAN</div>
  <h1>Choose what you want to capture</h1><p className="scan-camera-muted">This page uses your camera only after you approve browser permission. Your selected capture will be sent to the scan creator.</p>
  <div className="capture-tabs"><button className={mode==="video"?"active":""} onClick={()=>setMode("video")}>🎥 Video</button><button className={mode==="photo"?"active":""} onClick={()=>setMode("photo")}>📸 Photo</button></div>
  {mode==="video"&&<div className="duration-row"><b>Video length</b><div>{[5,10,15,30,60].map(n=><button key={n} className={seconds===n?"selected":""} onClick={()=>setSeconds(n)}>{n}s</button>)}</div></div>}
  <button className="btn primary camera-main-btn" onClick={()=>setStage("permission")}>Continue to Camera →</button>
 </div></main>;

 if(stage==="permission")return <main className="scan-camera-page"><div className="scan-camera-card">
  <div className="scan-camera-brand">Skan<span>Makery</span></div><div className="scan-camera-pill">CAMERA PERMISSION</div>
  <h1>Allow camera access</h1><p className="scan-camera-muted">Your browser will now ask for camera permission. Nothing is captured until you press <b>Start {mode==="video"?"Video":"Photo"}</b>.</p>
  <button className="btn primary camera-main-btn" onClick={openCamera}>Allow Camera →</button>
  {error&&<p className="error">{error}</p>}
 </div></main>;

 return <main className="scan-tiktok-page">
  <header className="scan-tiktok-top"><a href="/" className="scan-back">‹</a><div className="scan-tabs"><b>For You</b><span>Following</span></div><span>•••</span></header>
  <div className="scan-tiktok-feed">
   {feed.length?feed.map(v=><article className="scan-tiktok-video" key={v._id}><video src={v.videoUrl} poster={v.thumbnailUrl||undefined} autoPlay muted loop playsInline/><div className="scan-tiktok-shade"/><div className="scan-tiktok-copy"><b>@SkanMakery <span className="verified">✓</span></b><h2>{v.title}</h2><p>{v.caption}</p></div><aside><span>♥<small>{v.likes}</small></span><span>💬<small>{v.comments?.length||0}</small></span><span>↗<small>{v.shares}</small></span></aside></article>):<div className="scan-tiktok-empty">No videos published yet.</div>}
  </div>
  <div className="scan-capture-bar"><div><b>{mode==="video"?"🎥 Video Recorder":"📸 Photo Recorder"}</b><small>{mode==="video"?seconds+" seconds":"Single photo"}</small></div><button className="btn primary" disabled={stage==="capturing"||uploading} onClick={startCapture}>{uploading?"Sending…":"Start "+(mode==="video"?"Video":"Photo")}</button></div>
  <video ref={video} className="scan-camera-preview" playsInline muted/>
  {stage==="capturing"&&mode==="video"&&<div className="scan-recording-badge">● Recording {seconds}s…</div>}
  {error&&<div className="scan-inline-error">{error}</div>}
  {stage==="done"&&<div className="scan-prank-overlay"><div className="scan-prank-card"><div className="scan-prank-check">✓</div><h1>YOU'VE BEEN PRANKED!</h1><p>Your selected photo or video has been sent to the scan creator 😂</p><a className="btn primary" href="/register" target="_blank" rel="noopener noreferrer">CREATE YOUR OWN PRANK</a></div></div>}
 </main>;
}
