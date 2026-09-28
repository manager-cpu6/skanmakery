"use client";
import {useEffect,useState} from "react";

type Status={
 smtp:{
  host:boolean;port:boolean;user:boolean;password:boolean;from:boolean;
  portValue:string;hostValue:string;userValue:string;fromValue:string;
 };
 pending:number;
};

export default function OTPControl(){
 const [data,setData]=useState<Status|null>(null);
 const [email,setEmail]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");

 async function load(){
  const r=await fetch("/api/admin/otp",{cache:"no-store"});
  if(r.ok)setData(await r.json());
 }
 useEffect(()=>{load()},[]);

 async function action(name:string){
  setBusy(true);setMessage("");setError("");
  const r=await fetch("/api/admin/otp",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({action:name,email})
  });
  const d=await r.json().catch(()=>({}));
  setBusy(false);
  if(!r.ok){setError(d.error||"Action failed");return}
  setMessage(d.message||"Done");
  load();
 }

 const ready=data?.smtp.host&&data?.smtp.user&&data?.smtp.password&&data?.smtp.from;

 return <div className="dashboard">
  <aside className="side">
   <div className="brand">Skan<span>Makery</span></div>
   <div style={{marginTop:30}}>
    <a href="/admin">Overview</a>
    <a href="/admin/users">Users</a>
    <a href="/admin/qrs">QR Codes</a>
    <a href="/admin/videos">Videos</a>
    <a className="nav-active" href="/admin/otp">OTP / Email</a>
    <a href="/admin/settings">Settings</a>
    <a href="/dashboard">User Dashboard</a>
   </div>
  </aside>
  <main className="main">
   <div className="page-head">
    <span className="eyebrow">AUTHENTICATION</span>
    <h1>OTP & Email Control</h1>
    <p>Check SMTP, test verification emails and clean pending verification codes.</p>
   </div>

   {error&&<div className="auth-error">{error}</div>}
   {message&&<div className="auth-success">{message}</div>}

   <div className="admin-control-grid">
    <section className="card admin-control-card">
     <div className="control-icon">✉️</div>
     <h2>SMTP Status</h2>
     <p className="auth-muted">Vercel server-side email configuration.</p>
     <div className="status-list">
      <div><span>Host</span><b className={data?.smtp.host?"ok":"bad"}>{data?.smtp.host?"✓ Set":"✕ Missing"}</b></div>
      <div><span>Port</span><b className={data?.smtp.port?"ok":"bad"}>{data?.smtp.port?data.smtp.portValue:"Missing"}</b></div>
      <div><span>Username</span><b className={data?.smtp.user?"ok":"bad"}>{data?.smtp.user?"✓ Set":"✕ Missing"}</b></div>
      <div><span>Password</span><b className={data?.smtp.password?"ok":"bad"}>{data?.smtp.password?"✓ Set":"✕ Missing"}</b></div>
      <div><span>From</span><b className={data?.smtp.from?"ok":"bad"}>{data?.smtp.from?"✓ Set":"✕ Missing"}</b></div>
     </div>
     <div className="helper">Password is never displayed. Add it only in Vercel → Settings → Environment Variables → Production.</div>
    </section>

    <section className="card admin-control-card">
     <div className="control-icon">🧪</div>
     <h2>Send Test Email</h2>
     <p className="auth-muted">Send a real SMTP test before testing signup.</p>
     <div className="field">
      <label>Test recipient</label>
      <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder={data?.smtp.fromValue||"your@email.com"}/>
     </div>
     <button className="btn primary create-btn" disabled={busy||!ready} onClick={()=>action("test")}>
      {busy?"Sending…":"Send Test Email"}
     </button>
     {!ready&&<p className="error" style={{marginTop:10}}>SMTP password is missing in Production.</p>}
    </section>

    <section className="card admin-control-card">
     <div className="control-icon">🔐</div>
     <h2>Pending OTPs</h2>
     <div className="stat">{data?.pending??"—"}</div>
     <p className="auth-muted">Signup and password-reset codes that have not expired yet.</p>
     <button className="btn light" disabled={busy} onClick={()=>action("clear")}>Clear All Pending OTPs</button>
    </section>
   </div>

   <section className="card" style={{marginTop:20}}>
    <h2>Production SMTP variables</h2>
    <div className="env-table">
     <div><b>SMTP_HOST</b><span>{data?.smtp.hostValue||"mail.spacemail.com"}</span></div>
     <div><b>SMTP_PORT</b><span>{data?.smtp.portValue||"465"}</span></div>
     <div><b>SMTP_USER</b><span>{data?.smtp.userValue||"Not configured"}</span></div>
     <div><b>SMTP_PASSWORD</b><span>•••••••••••• (hidden)</span></div>
     <div><b>SMTP_FROM</b><span>{data?.smtp.fromValue||"Not configured"}</span></div>
    </div>
    <p className="helper">After changing Vercel environment variables, redeploy Production so the new values are available to the deployed function. citeturn0search0</p>
   </section>
  </main>
 </div>
}
