// @ts-nocheck
import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import Link from "next/link";
export const dynamic="force-dynamic";

export default async function Admin(){
 const s=await getSession();if(!s||s.role!=="admin")redirect("/login");
 const db=await getDb();
 const [users,qrs,scans,barcodes,videos,followers,likes,pendingOtp,mediaFiles,qrAgg,scanAgg,captureAgg,locationAgg]=await Promise.all([
  db.collection("users").countDocuments(),db.collection("qrcodes").countDocuments(),db.collection("scan_campaigns").countDocuments(),
  db.collection("barcodes").countDocuments(),db.collection("videos").countDocuments({active:{$ne:false}}),db.collection("follows").countDocuments(),
  db.collection("video_likes").countDocuments(),db.collection("verification_codes").countDocuments({expiresAt:{$gt:new Date()}}),
  db.collection("media.files").countDocuments(),
  db.collection("qrcodes").aggregate([{$group:{_id:null,total:{$sum:{$ifNull:["$scanCount",0]}}}}]).toArray(),
  db.collection("scan_campaigns").aggregate([{$group:{_id:null,total:{$sum:{$ifNull:["$views",0]}}}}]).toArray(),
  db.collection("scan_campaigns").aggregate([{$group:{_id:null,total:{$sum:{$ifNull:["$captures",0]}}}}]).toArray(),
  db.collection("scan_campaigns").aggregate([{$group:{_id:null,total:{$sum:{$ifNull:["$locations",0]}}}}]).toArray()
 ]);
 const qrScans=qrAgg[0]?.total||0,views=scanAgg[0]?.total||0,captures=captureAgg[0]?.total||0,locations=locationAgg[0]?.total||0;
 const nav=[["Overview","/admin","◈"],["Users","/admin/users","♙"],["Credits","/admin/credits","⚡"],["QR Codes","/admin/qrs","▦"],["Scans","/admin/scans","⌁"],["Videos","/admin/videos","▶"],["OTP / Email","/admin/otp","✉"],["Settings","/admin/settings","⚙"]];
 return <div className="admin-shell">
  <aside className="admin-sidebar"><Link href="/admin" className="admin-brand">Skan<span>Makery</span><small>CONTROL CENTER</small></Link><div className="admin-status"><i/> SYSTEM ONLINE <span>2026</span></div><nav>{nav.map(([label,href,icon])=><Link key={href} href={href} className={href==="/admin"?"active":""}><b>{icon}</b><span>{label}</span></Link>)}</nav><div className="admin-side-bottom"><Link href="/dashboard">↩ User workspace</Link><small>Protected administrator area</small></div></aside>
  <main className="admin-main">
   <header className="admin-header"><div><span className="admin-kicker">SKANMAKERY / ADMIN</span><h1>Command Center</h1><p>Monitor and manage the complete platform from one workspace.</p></div><div className="admin-header-actions"><Link href="/admin/otp">Email health</Link><Link href="/dashboard">Open app ↗</Link></div></header>
   <section className="admin-hero"><div><span>CONTROL EVERYTHING</span><h2>Your platform, in one view.</h2><p>Users, QR codes, barcodes, scan campaigns, captures, locations, media, videos and email are connected here.</p></div><div className="admin-orbit"><div>ADMIN</div><span>USERS</span><span>QR</span><span>SCANS</span><span>MEDIA</span></div></section>
   <section className="admin-stat-grid-modern">
    <article><span>USERS</span><strong>{users}</strong><small>Registered accounts</small><i>♙</i></article>
    <article><span>QR CODES</span><strong>{qrs}</strong><small>{qrScans} total QR scans</small><i>▦</i></article>
    <article><span>SCAN CAMPAIGNS</span><strong>{scans}</strong><small>{views} campaign views</small><i>⌁</i></article>
    <article><span>BARCODES</span><strong>{barcodes}</strong><small>Generated records</small><i>▥</i></article>
    <article><span>VIDEOS</span><strong>{videos}</strong><small>Active public videos</small><i>▶</i></article>
    <article><span>MEDIA FILES</span><strong>{mediaFiles}</strong><small>GridFS files</small><i>◉</i></article>
    <article><span>CAPTURES</span><strong>{captures}</strong><small>Camera captures received</small><i>●</i></article>
    <article><span>LOCATION EVENTS</span><strong>{locations}</strong><small>Location events</small><i>📍</i></article>
   </section>
   <div className="admin-content-grid">
    <section className="admin-panel"><div className="admin-panel-head"><div><span>OPERATIONS</span><h2>Management modules</h2></div><small>Direct access</small></div><div className="admin-module-grid">
     <Link href="/admin/users"><b>♙</b><div><strong>Users</strong><small>Accounts, status and records</small></div><em>→</em></Link><Link href="/admin/credits"><b>⚡</b><div><strong>Credits</strong><small>Balances, grants and Cryptomus payments</small></div><em>→</em></Link>
     <Link href="/admin/qrs"><b>▦</b><div><strong>QR Codes</strong><small>Owners, types and scan counts</small></div><em>→</em></Link>
     <Link href="/admin/scans"><b>⌁</b><div><strong>Scan Center</strong><small>Location, photo and video campaigns</small></div><em>→</em></Link>
     <Link href="/admin/videos"><b>▶</b><div><strong>Video Studio</strong><small>Feed, profile, likes and publishing</small></div><em>→</em></Link>
     <Link href="/admin/otp"><b>✉</b><div><strong>OTP & Email</strong><small>SMTP health and verification codes</small></div><em>→</em></Link>
     <Link href="/admin/settings"><b>⚙</b><div><strong>System Settings</strong><small>Platform configuration</small></div><em>→</em></Link>
    </div></section>
    <section className="admin-panel"><div className="admin-panel-head"><div><span>ENGAGEMENT</span><h2>Platform activity</h2></div></div>
     <div className="admin-mini-row"><span>Followers</span><b>{followers}</b><small>follow relationships</small></div>
     <div className="admin-mini-row"><span>Video likes</span><b>{likes}</b><small>user like records</small></div>
     <div className="admin-mini-row"><span>Pending OTP</span><b>{pendingOtp}</b><small>unexpired verification codes</small></div>
     <div className={"admin-alert "+(pendingOtp>0?"":"ok")}><b>{pendingOtp>0?"✉ Pending verification activity":"✓ Email queue clear"}</b><span>{pendingOtp>0?"Open OTP / Email to inspect SMTP and verification records.":"No unexpired verification codes are waiting."}</span><Link href="/admin/otp">Open email control →</Link></div>
    </section>
   </div>
   <section className="admin-panel admin-quick"><div className="admin-panel-head"><div><span>QUICK ACTIONS</span><h2>Jump directly to what you need</h2></div></div><div className="quick-links"><Link href="/admin/users">Manage users</Link><Link href="/admin/qrs">Inspect QR library</Link><Link href="/admin/scans">Inspect scans</Link><Link href="/admin/videos">Manage videos</Link><Link href="/admin/otp">Test email</Link><Link href="/dashboard/create">Create QR / Barcode</Link></div></section>
  </main>
 </div>;
}