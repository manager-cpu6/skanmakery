"use client";
import {useEffect,useRef,useState} from "react";
export default function CameraPrank({params}:{params:Promise<{slug:string}>}){
 const [cfg,setCfg]=useState<any>(null),[ready,setReady]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false);
 const video=useRef<HTMLVideoElement>(null),canvas=useRef<HTMLCanvasElement>(null),stream=useRef<MediaStream|null>(null),rec=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]);
 useEffect(()=>{params.then(p=>fetch("/api/scan/"+p.slug).then(r=>r.ok?r.json():Promise.reject()).then(setCfg).catch(()=>setError("This scan is not available.")));return()=>stream.current?.getTracks().forEach(t=>t.stop())},[]);
 async function start(){
  setError("");
  try{
   const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:cfg.camera==="front"?"user":"environment"},audio:cfg.mode==="video"});
   stream.current=s;if(video.current){video.current.srcObject=s;await video.current.play()}setReady(true);
   if(cfg.mode==="video"){const mr=new MediaRecorder(s,{mimeType:"video/webm"});chunks.current=[];mr.ondataavailable=e=>e.data.size&&chunks.current.push(e.data);mr.onstop=()=>{setDone(true);s.getTracks().forEach(t=>t.stop())};rec.current=mr;mr.start();setTimeout(()=>mr.state==="recording"&&mr.stop(),cfg.seconds*1000)}
  }catch{setError("Camera permission was not granted. Please allow camera access in your browser settings and try again.")}
 }
 function photo(){if(!video.current||!canvas.current)return;const c=canvas.current;c.width=video.current.videoWidth;c.height=video.current.videoHeight;c.getContext("2d")?.drawImage(video.current,0,0);c.toBlob(()=>setDone(true),"image/jpeg",.92);stream.current?.getTracks().forEach(t=>t.stop())}
 if(error)return <main className="prank-page"><div className="prank-card"><div className="prank-icon">📷</div><h1>{error}</h1><p>Camera access is controlled by your browser. SkanMakery cannot turn it on without your permission.</p></div></main>;
 if(!cfg)return <main className="prank-page"><div className="prank-card">Loading…</div></main>;
 return <main className="prank-page"><div className="prank-card"><div className="prank-brand">Skan<span>Makery</span></div><div className="prank-badge">{cfg.mode==="video"?"🎥 Video Capture":"📸 Photo Capture"}</div><h1>{cfg.title}</h1><p>{cfg.message||"Allow camera access to continue."}</p>{!ready&&!done&&<><div className="permission-box">🔐 <b>Camera permission required</b><small>Your browser will ask you to Allow camera access. Nothing starts until you approve.</small></div><button className="btn primary prank-btn" onClick={start}>Allow & Continue →</button></>}{ready&&!done&&cfg.mode==="photo"&&<><video ref={video} className="prank-camera" playsInline muted/><button className="btn primary prank-btn" onClick={photo}>📸 Take Photo</button></>}{ready&&!done&&cfg.mode==="video"&&<><video ref={video} className="prank-camera" playsInline muted/><div className="recording">● Recording · {cfg.seconds}s</div></>}{done&&<div className="permission-box">✓ Capture complete<small>Your browser has completed the requested capture.</small></div>}<canvas ref={canvas} hidden/></div></main>;
}
