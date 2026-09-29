"use client";
import {useEffect,useState} from "react";
type V={_id:string;title:string;caption:string;videoUrl:string;thumbnailUrl?:string;views:number;likes:number};
type P={username:string;displayName:string;bio:string;avatarUrl:string;verified:boolean;followers:number;following:number;views:number;videos:V[]};
const fmt=(n:number)=>n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(1)+"K":String(n);
export default function Profile(){
 const [p,setP]=useState<P|null>(null),[following,setFollowing]=useState(false),[busy,setBusy]=useState(false);
 const load=()=>fetch("/api/profile").then(r=>r.json()).then(setP);
 useEffect(()=>{load()},[]);
 const follow=async()=>{setBusy(true);const r=await fetch("/api/profile/follow",{method:"POST"});const x=await r.json();if(r.ok){setFollowing(x.following);setP(q=>q?{...q,followers:x.followers}:q)}setBusy(false)};
 if(!p)return <main className="profile-page"><div className="reels-loading">Loading profile…</div></main>;
 return <main className="profile-page"><header className="profile-top"><a href="/videos">‹ Videos</a><div className="profile-top-title">Profile</div><a href="/login">Login</a></header><section className="profile-hero"><div className="profile-avatar-wrap">{p.avatarUrl?<img src={p.avatarUrl} className="profile-avatar" alt=""/>:<div className="profile-avatar fallback">S</div>}</div><div className="profile-name"><h1>{p.displayName} {p.verified&&<span className="verified">✓</span>}</h1><p>@{p.username}</p></div><p className="profile-bio">{p.bio}</p><div className="profile-stats"><div><b>{fmt(p.views)}</b><span>Views</span></div><div><b>{fmt(p.videos.length)}</b><span>Videos</span></div><div><b>{fmt(p.followers)}</b><span>Followers</span></div><div><b>{fmt(p.following)}</b><span>Following</span></div></div><button className={"profile-follow "+(following?"is-following":"")} onClick={follow} disabled={busy}>{following?"Following":"Follow"}</button></section><section className="profile-grid">{p.videos.map(v=><a href={"/videos#"+v._id} className="profile-video" key={v._id}><video src={v.videoUrl} poster={v.thumbnailUrl||undefined} muted playsInline preload="metadata"/><span>▶</span><small>♥ {fmt(v.likes)} · 👁 {fmt(v.views)}</small></a>)}</section></main>;
}
