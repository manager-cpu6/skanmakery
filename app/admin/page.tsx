import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";
import {getDb} from "@/lib/mongodb";
import Link from "next/link";

export default async function Admin(){
 const s=await getSession();
 if(!s||s.role!=="admin")redirect("/login");
 const db=await getDb();
 const users=await db.collection("users").countDocuments();
 const qrs=await db.collection("qrcodes").countDocuments();
 const scans=(await db.collection("qrcodes").aggregate([{$group:{_id:null,total:{$sum:"$scanCount"}}}]).toArray())[0]?.total||0;
 const pendingOtp=await db.collection("verification_codes").countDocuments({expiresAt:{$gt:new Date()}});
 return <div className="dashboard">
  <aside className="side">
   <div className="brand">Skan<span>Makery</span></div>
   <div style={{marginTop:30}}>
    <a className="nav-active" href="/admin">Overview</a>
    <a href="/admin/users">Users</a>
    <a href="/admin/qrs">QR Codes</a>
    <a href="/admin/videos">Videos</a>
    <a href="/admin/otp">OTP / Email</a>
    <a href="/admin/settings">Settings</a>
    <a href="/dashboard">User Dashboard</a>
   </div>
  </aside>
  <main className="main">
   <div className="topline">
    <div><span className="eyebrow">SYSTEM ADMIN</span><h1>Admin Panel</h1><p style={{color:"#667085"}}>Manage SkanMakery from one control center.</p></div>
   </div>

   <div className="cards">
    <div className="card"><div>Total Users</div><div className="stat">{users}</div></div>
    <div className="card"><div>Total QR Codes</div><div className="stat">{qrs}</div></div>
    <div className="card"><div>Total Scans</div><div className="stat">{scans}</div></div>
    <div className="card"><div>Pending OTP</div><div className="stat">{pendingOtp}</div></div>
   </div>

   <div className="admin-module-grid">
    <Link href="/admin/users" className="admin-module"><span>👥</span><div><b>Users</b><small>View and manage accounts</small></div><strong>→</strong></Link>
    <Link href="/admin/qrs" className="admin-module"><span>🔳</span><div><b>QR Codes</b><small>Manage generated QR codes</small></div><strong>→</strong></Link>
    <Link href="/admin/videos" className="admin-module"><span>🎬</span><div><b>Video Studio</b><small>Manage public video content</small></div><strong>→</strong></Link>
    <Link href="/admin/otp" className="admin-module"><span>✉️</span><div><b>OTP / Email</b><small>SMTP status, test email and OTP cleanup</small></div><strong>→</strong></Link>
    <Link href="/admin/settings" className="admin-module"><span>⚙️</span><div><b>Settings</b><small>System configuration</small></div><strong>→</strong></Link>
    <Link href="/dashboard" className="admin-module"><span>🏠</span><div><b>User Dashboard</b><small>Open the normal user area</small></div><strong>→</strong></Link>
   </div>

   <section className="card" style={{marginTop:22}}>
    <h2>OTP problem detected</h2>
    <p style={{color:"#667085",lineHeight:1.6}}>The latest Production runtime error is <b>Missing credentials for "PLAIN"</b>. Open OTP / Email above and check SMTP credentials. The SMTP password must exist in Vercel Production environment variables.</p>
    <Link href="/admin/otp" className="btn primary">Open OTP Control →</Link>
   </section>
  </main>
 </div>
}
