// @ts-nocheck
"use client";
import {useEffect,useState} from "react";
export default function UsersAdmin(){
 const [items,setItems]=useState<any[]>([]),[q,setQ]=useState(""),[msg,setMsg]=useState("");
 const load=()=>fetch("/api/admin/users").then(r=>r.json()).then(x=>setItems(Array.isArray(x)?x:[]));
 useEffect(load,[]);
 const action=async(id:string,action:string)=>{
  const r=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action})});
  const x=await r.json();setMsg(x.message||x.error||"Done");load();
 };
 const filtered=items.filter(x=>(x.email+" "+x.name).toLowerCase().includes(q.toLowerCase()));
 return <div className="dashboard"><aside className="side"><div className="brand">Skan<span>Makery</span></div><div style={{marginTop:30}}><a href="/admin">Overview</a><a className="nav-active" href="/admin/users">Users</a><a href="/admin/qrs">QR Codes</a><a href="/admin/scans">Scans</a><a href="/admin/videos">Videos</a><a href="/admin/otp">OTP / Email</a><a href="/admin/settings">Settings</a></div></aside><main className="main"><div className="page-head"><span className="eyebrow">USER CONTROL</span><h1>Users</h1><p>Accounts, plans, status and activity.</p></div><div className="card"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name or email…" style={{width:"100%"}}/>{msg&&<p className="success">{msg}</p>}</div><div className="video-admin-list" style={{marginTop:18}}>{filtered.map(u=><div className="video-admin-card" key={u._id}><div><b>{u.name||"Unnamed user"}</b><p>{u.email}</p><small>Plan: {u.plan||"free"} · Status: {u.status||"active"} · Joined: {u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}</small></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="btn light" onClick={()=>action(u._id,u.status==="suspended"?"activate":"suspend")}>{u.status==="suspended"?"Activate":"Suspend"}</button><button className="btn light" onClick={()=>action(u._id,"makeAdmin")}>Make Admin</button></div></div>)}</div></main></div>
}