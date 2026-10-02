import Link from "next/link";
import {getSession} from "@/lib/auth";
import {redirect} from "next/navigation";
import {getDb} from "@/lib/mongodb";
import {getCreditAccount} from "@/lib/credits";

export default async function Dashboard(){
 const s=await getSession();if(!s)redirect("/login");
 const db=await getDb();
 const [qrCount,scanCount,barCount,recentQrs,recentScans,credit]=await Promise.all([
  db.collection("qrcodes").countDocuments({userId:s.userId}),
  db.collection("scan_campaigns").countDocuments({userId:s.userId}),
  db.collection("barcodes").countDocuments({userId:s.userId}),
  db.collection("qrcodes").find({userId:s.userId}).sort({createdAt:-1}).limit(4).toArray(),
  db.collection("scan_campaigns").find({userId:s.userId}).sort({createdAt:-1}).limit(4).toArray(),
  getCreditAccount(s.userId)
 ]);
 const totalViews=(await db.collection("scan_campaigns").aggregate([{$match:{userId:s.userId}},{$group:{_id:null,total:{$sum:{$ifNull:["$views",0]}}}}]).toArray())[0]?.total||0;
 return <div className="spatial-dashboard">
  <aside className="spatial-sidebar glass">
   <Link href="/dashboard" className="spatial-logo">Skan<span>Makery</span></Link>
   <div className="workspace-card"><div className="workspace-avatar">{String(s.name||"U").slice(0,1).toUpperCase()}</div><div><b>{s.name}</b><small>Personal workspace</small></div><span>⌄</span></div>
   <nav className="spatial-nav"><span className="nav-label">WORKSPACE</span><Link className="active" href="/dashboard">⌂ Overview</Link><Link href="/dashboard/create">＋ Create QR</Link><Link href="/dashboard/scans">📸 Scans</Link><Link href="/dashboard/qrs">▦ QR Library</Link><Link href="/dashboard/credits">⚡ Credits</Link><Link href="/videos">▶ Discover</Link><span className="nav-label">TOOLS</span><Link href="/profile">◎ Profile</Link>{s.role==="admin"&&<Link href="/admin">⚙ Admin</Link>}</nav>
   <div className="sidebar-bottom"><div className="upgrade-mini"><b>✦ SkanMakery Pro</b><small>More analytics, storage & customization.</small><Link href="/dashboard/create">Explore →</Link></div><small>Made for creators · 2026</small></div>
  </aside>
  <main className="spatial-main">
   <header className="spatial-top"><div><span className="spatial-kicker">GOOD TO SEE YOU</span><h1>Welcome, {s.name} <span>✦</span></h1><p>Your creation space is ready.</p></div><div className="top-actions"><Link href="/dashboard/credits" className="credit-top-pill">⚡ <b>{Number(credit.balance||0)}</b> credits</Link><Link href="/dashboard/create" className="glass-icon">⌕</Link><Link href="/dashboard/create" className="spatial-create">＋ Create</Link></div></header>
   <section className="spatial-hero">
    <div className="hero-copy"><span className="hero-chip">✦ CREATOR STUDIO</span><h2>Turn a scan into<br/><em>an experience.</em></h2><p>Build QR codes, media pages, location maps, camera scans and barcodes from one clean workspace.</p><div className="hero-buttons"><Link href="/dashboard/create" className="hero-primary">Create something →</Link><Link href="/dashboard/scans" className="hero-secondary">Explore scans</Link></div></div>
    <div className="hero-orbit"><div className="orb orb-a"/><div className="orb orb-b"/><div className="hero-center"><span>▦</span><small>SCAN</small></div><div className="hero-float f1">📍<b>Location</b></div><div className="hero-float f2">▥<b>Barcode</b></div><div className="hero-float f3">🎬<b>Media</b></div></div>
   </section>
   <section className="spatial-stats"><Link href="/dashboard/credits" className="glass credit-stat-card"><span>CREDITS</span><strong>{Number(credit.balance||0)}</strong><small>Available · +25 every 7 days</small><i>⚡</i></Link><article className="glass"><span>QR CODES</span><strong>{qrCount}</strong><small>Created in your library</small><i>▦</i></article><article className="glass"><span>SCANS</span><strong>{scanCount}</strong><small>Camera & location links</small><i>⌁</i></article><article className="glass"><span>BARCODES</span><strong>{barCount}</strong><small>Product & ID codes</small><i>▥</i></article><article className="glass"><span>VIEWS</span><strong>{totalViews}</strong><small>Scan page views</small><i>◉</i></article></section>
   <section className="spatial-create-row"><div className="section-title"><span>CREATE FAST</span><h2>What are you making?</h2></div><div className="create-cards"><Link href="/dashboard/create" className="create-card c1"><span>▦</span><b>QR Code</b><small>Web, text, payment, Wi‑Fi, media & more</small><strong>→</strong></Link><Link href="/dashboard/create" className="create-card c2"><span>▥</span><b>Barcode</b><small>Code 128, EAN-13, UPC-A and more</small><strong>→</strong></Link><Link href="/dashboard/scans" className="create-card c3"><span>😈</span><b>PRANK SCAN</b><small>Consent-based photo or video capture</small><strong>→</strong></Link><Link href="/dashboard/scans" className="create-card c4"><span>📍</span><b>Location Scan</b><small>Save your location and show it on Maps</small><strong>→</strong></Link></div></section>
   <section className="spatial-columns"><div className="glass recent-panel"><div className="panel-head"><div><span>RECENT</span><h2>My scans</h2></div><Link href="/dashboard/scans">View all →</Link></div>{recentScans.length?recentScans.map((x:any)=><div className="recent-item" key={String(x._id)}><div className="recent-icon">{x.type==="location"?"📍":"📸"}</div><div><b>{x.name}</b><small>{x.type==="location"?"Location map":x.mode==="video"?"Video capture":"Photo capture"}</small></div><span className="live-dot">Active</span><a href={"/scan/"+x.slug} target="_blank">Open ↗</a></div>):<div className="empty-state">No scans yet.<Link href="/dashboard/scans">Create your first scan →</Link></div>}</div>
   <div className="glass recent-panel"><div className="panel-head"><div><span>LIBRARY</span><h2>Recent QR codes</h2></div><Link href="/dashboard/qrs">View all →</Link></div>{recentQrs.length?recentQrs.map((x:any)=><div className="recent-item" key={String(x._id)}><div className="recent-icon">▦</div><div><b>{x.name}</b><small>{x.type} · {x.scanCount||0} scans</small></div><a href={"/q/"+x.slug} target="_blank">Open ↗</a></div>):<div className="empty-state">Your QR library is empty.<Link href="/dashboard/create">Create a QR →</Link></div>}</div></section>
  </main>
 </div>;
}