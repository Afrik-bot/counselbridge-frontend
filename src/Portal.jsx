import { useState, useEffect, useRef, useCallback } from "react";
import { AuthAPI, MattersAPI, MessagesAPI, DocumentsAPI, InvoicesAPI, AIAPI, TokenStore, normalizeMatter, normalizeMessages, normalizeInvoices, normalizeAIQueue } from "./useAPI.js";

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:       #0F2240;
    --navy-mid:   #1B3A5C;
    --blue:       #2563EB;
    --blue-light: #3B82F6;
    --blue-pale:  #EFF6FF;
    --blue-pale2: #DBEAFE;
    --teal:       #0D9488;
    --teal-pale:  #F0FDFA;
    --amber:      #D97706;
    --amber-pale: #FFFBEB;
    --red:        #DC2626;
    --red-pale:   #FEF2F2;
    --green:      #059669;
    --green-pale: #ECFDF5;
    --purple:     #7C3AED;
    --purple-pale:#F5F3FF;
    --gray-50:    #F8FAFC;
    --gray-100:   #F1F5F9;
    --gray-200:   #E2E8F0;
    --gray-300:   #CBD5E1;
    --gray-400:   #94A3B8;
    --gray-500:   #64748B;
    --gray-600:   #475569;
    --gray-700:   #334155;
    --gray-800:   #1E293B;
    --gray-900:   #0F172A;
    --white:      #FFFFFF;
    --font-serif: 'Instrument Serif', Georgia, serif;
    --font-sans:  'DM Sans', system-ui, sans-serif;
    --shadow-sm:  0 1px 3px rgba(15,34,64,0.08), 0 1px 2px rgba(15,34,64,0.06);
    --shadow-md:  0 4px 12px rgba(15,34,64,0.10), 0 2px 4px rgba(15,34,64,0.06);
    --shadow-lg:  0 10px 30px rgba(15,34,64,0.14), 0 4px 8px rgba(15,34,64,0.08);
    --shadow-xl:  0 20px 50px rgba(15,34,64,0.18), 0 8px 16px rgba(15,34,64,0.10);
    --radius-sm:  6px;
    --radius-md:  10px;
    --radius-lg:  16px;
    --radius-xl:  24px;
    --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  html, body, #root { height: 100%; font-family: var(--font-sans); background: var(--gray-50); color: var(--gray-800); }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--gray-400); }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.4)} 50%{box-shadow:0 0 0 6px rgba(37,99,235,0)} }

  .fade-in { animation: fadeIn 0.3s ease both; }
  .slide-in { animation: slideIn 0.25s ease both; }

  /* Buttons */
  .btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:var(--radius-sm); font-family:var(--font-sans); font-size:13.5px; font-weight:500; cursor:pointer; border:none; transition:all var(--transition); white-space:nowrap; }
  .btn-primary { background:var(--blue); color:var(--white); }
  .btn-primary:hover { background:#1D4ED8; transform:translateY(-1px); box-shadow:var(--shadow-md); }
  .btn-secondary { background:var(--white); color:var(--gray-700); border:1.5px solid var(--gray-200); }
  .btn-secondary:hover { background:var(--gray-50); border-color:var(--gray-300); }
  .btn-ghost { background:transparent; color:var(--gray-600); }
  .btn-ghost:hover { background:var(--gray-100); color:var(--gray-800); }
  .btn-danger { background:var(--red-pale); color:var(--red); border:1.5px solid #FECACA; }
  .btn-danger:hover { background:#FEE2E2; }
  .btn-purple { background:var(--purple); color:var(--white); }
  .btn-purple:hover { background:#6D28D9; }
  .btn-sm { padding:5px 11px; font-size:12.5px; }
  .btn-lg { padding:11px 22px; font-size:15px; }
  .btn:disabled { opacity:0.5; cursor:not-allowed; transform:none !important; }

  /* Cards */
  .card { background:var(--white); border-radius:var(--radius-lg); border:1px solid var(--gray-200); box-shadow:var(--shadow-sm); }
  .card-hover:hover { border-color:var(--gray-300); box-shadow:var(--shadow-md); transform:translateY(-1px); transition:all var(--transition); cursor:pointer; }

  /* Badges */
  .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:20px; font-size:11.5px; font-weight:600; letter-spacing:0.02em; }
  .badge-blue { background:var(--blue-pale2); color:#1D4ED8; }
  .badge-green { background:var(--green-pale); color:#047857; }
  .badge-amber { background:var(--amber-pale); color:#92400E; }
  .badge-red { background:var(--red-pale); color:#B91C1C; }
  .badge-purple { background:var(--purple-pale); color:#5B21B6; }
  .badge-gray { background:var(--gray-100); color:var(--gray-600); }
  .badge-teal { background:var(--teal-pale); color:#0F766E; }

  /* Form elements */
  .input { width:100%; padding:9px 13px; border:1.5px solid var(--gray-200); border-radius:var(--radius-sm); font-family:var(--font-sans); font-size:14px; color:var(--gray-800); background:var(--white); transition:border-color var(--transition); outline:none; }
  .input:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
  .input::placeholder { color:var(--gray-400); }
  .textarea { resize:vertical; min-height:80px; }
  .select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:32px; cursor:pointer; }
  label { font-size:13px; font-weight:500; color:var(--gray-600); display:block; margin-bottom:5px; }

  /* Tabs */
  .tab-bar { display:flex; gap:2px; border-bottom:2px solid var(--gray-200); }
  .tab { padding:9px 16px; font-size:13.5px; font-weight:500; color:var(--gray-500); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all var(--transition); white-space:nowrap; }
  .tab:hover { color:var(--gray-800); }
  .tab.active { color:var(--blue); border-bottom-color:var(--blue); }

  /* Status dots */
  .dot { width:8px; height:8px; border-radius:50%; display:inline-block; flex-shrink:0; }
  .dot-green { background:var(--green); }
  .dot-blue { background:var(--blue); }
  .dot-amber { background:var(--amber); }
  .dot-red { background:var(--red); }
  .dot-gray { background:var(--gray-400); }

  /* Sidebar nav */
  .nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:var(--radius-sm); font-size:13.5px; font-weight:500; color:var(--gray-600); cursor:pointer; transition:all var(--transition); position:relative; }
  .nav-item:hover { background:rgba(255,255,255,0.08); color:var(--white); }
  .nav-item.active { background:rgba(37,99,235,0.25); color:var(--white); }
  .nav-item .badge-count { background:var(--red); color:var(--white); font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; margin-left:auto; }

  /* AI elements */
  .ai-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 7px; background:var(--purple-pale); color:var(--purple); border:1px solid #DDD6FE; border-radius:12px; font-size:11px; font-weight:600; }
  .ai-card { border:1.5px solid #DDD6FE; background:linear-gradient(135deg,#F5F3FF 0%,#EFF6FF 100%); border-radius:var(--radius-md); padding:14px; }
  .ai-typing { display:flex; gap:4px; align-items:center; }
  .ai-typing span { width:6px; height:6px; border-radius:50%; background:var(--purple); animation:bounce 1.4s ease infinite; }
  .ai-typing span:nth-child(2) { animation-delay:0.2s; }
  .ai-typing span:nth-child(3) { animation-delay:0.4s; }

  /* Timeline */
  .timeline-item { display:flex; gap:14px; position:relative; }
  .timeline-item::before { content:''; position:absolute; left:17px; top:32px; bottom:-8px; width:1.5px; background:var(--gray-200); }
  .timeline-item:last-child::before { display:none; }
  .timeline-dot { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px; }

  /* Message bubbles */
  .msg-bubble { max-width:72%; padding:10px 14px; border-radius:14px; font-size:13.5px; line-height:1.55; }
  .msg-bubble.sent { background:var(--blue); color:white; border-bottom-right-radius:4px; margin-left:auto; }
  .msg-bubble.received { background:var(--white); color:var(--gray-800); border:1px solid var(--gray-200); border-bottom-left-radius:4px; }
  .msg-bubble.internal { background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; border-bottom-left-radius:4px; }

  /* Loading shimmer */
  .shimmer { background:linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px; }

  /* Scrollable areas */
  .scroll-y { overflow-y:auto; }
  .scroll-x { overflow-x:auto; }

  /* Divider */
  .divider { height:1px; background:var(--gray-200); margin:16px 0; }

  /* Empty state */
  .empty-state { text-align:center; padding:48px 24px; color:var(--gray-400); }
  .empty-state svg { margin:0 auto 12px; display:block; opacity:0.4; }

  /* Notification dot */
  .notif-dot { width:8px; height:8px; background:var(--red); border-radius:50%; border:2px solid var(--white); position:absolute; top:6px; right:6px; }

  /* Tooltip */
  .tooltip { position:relative; }
  .tooltip:hover::after { content:attr(data-tip); position:absolute; bottom:calc(100%+6px); left:50%; transform:translateX(-50%); background:var(--gray-900); color:white; font-size:11.5px; padding:4px 8px; border-radius:5px; white-space:nowrap; z-index:100; }

  /* Progress bar */
  .progress-bar { height:6px; border-radius:3px; background:var(--gray-200); overflow:hidden; }
  .progress-fill { height:100%; border-radius:3px; background:var(--blue); transition:width 0.4s ease; }

  /* Status pill */
  .status-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }

  /* Hover reveal */
  .hover-actions { opacity:0; transition:opacity var(--transition); }
  *:hover > .hover-actions { opacity:1; }

  /* Prose text */
  .prose { font-size:14px; line-height:1.65; color:var(--gray-700); }

  /* Mobile responsive helpers */
  @media (max-width: 768px) {
    .hide-mobile { display:none !important; }
  }
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor", className = "" }) => {
  const paths = {
    home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    briefcase: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
    message: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
    calendar: "M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    plus: "M12 5v14 M5 12h14",
    x: "M18 6L6 18 M6 6l12 12",
    check: "M20 6L9 17l-5-5",
    "check-circle": "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
    "alert-circle": "M12 22a10 10 0 100-20 10 10 0 000 20z M12 8v4 M12 16h.01",
    info: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 16v-4 M12 8h.01",
    arrow_right: "M5 12h14 M12 5l7 7-7 7",
    arrow_left: "M19 12H5 M12 19l-7-7 7-7",
    chevron_down: "M6 9l6 6 6-6",
    chevron_right: "M9 18l6-6-6-6",
    chevron_left: "M15 18l-6-6 6-6",
    upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    trash: "M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2",
    send: "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
    paperclip: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
    mic: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v4 M8 23h8",
    video: "M23 7l-7 5 7 5V7z M1 5h15a2 2 0 012 2v10a2 2 0 01-2 2H1a2 2 0 01-2-2V7a2 2 0 012-2z",
    "eye": "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
    lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    clock: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    bar_chart: "M18 20V10 M12 20V4 M6 20v-6",
    layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    "more-h": "M12 13a1 1 0 100-2 1 1 0 000 2z M19 13a1 1 0 100-2 1 1 0 000 2z M5 13a1 1 0 100-2 1 1 0 000 2z",
    "folder": "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
    "link": "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    "tag": "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
    "cpu": "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
    "log-out": "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
    "inbox": "M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z",
    "refresh": "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
  };
  const d = paths[name] || paths.info;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={{flexShrink:0}}>
      {d.split(" M").map((seg, i) => <path key={i} d={(i === 0 ? "" : "M") + seg} />)}
    </svg>
  );
};


const MESSAGES = {
  1: [
    { id: 1, sender: "client", name: selectedMatter?.client || "Client", body: "Hi, just wanted to check in — is there any update on when the financial disclosure needs to be filed? I'm a bit worried about the deadline.", time: "9:14 AM", read: true, internal: false },
    { id: 2, sender: "attorney", name: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, body: "Hi Sarah, yes — we have a deadline of March 20 to file. I need to receive your bank statements and last two years of tax returns before I can complete the form. I sent you a document request last week — were you able to find those?", time: "10:32 AM", read: true, internal: false, aiGenerated: false },
    { id: 3, sender: "client", name: selectedMatter?.client || "Client", body: "Oh yes, I have them. I'll upload them tonight. Is there a specific format needed?", time: "11:05 AM", read: true, internal: false },
    { id: 4, sender: "staff", name: "Priya Patel (Paralegal)", body: "Note: Sarah called at 2pm — confirmed she'll upload by end of day.", time: "2:18 PM", read: true, internal: true },
    { id: 5, sender: "client", name: selectedMatter?.client || "Client", body: "I just tried to upload the bank statements but I'm getting an error. Can you help?", time: "8:47 PM", read: false, internal: false },
    { id: 6, sender: "client", name: selectedMatter?.client || "Client", body: "Never mind — it worked! I uploaded everything. Please let me know if you need anything else.", time: "9:02 PM", read: false, internal: false },
  ],
  3: [
    { id: 1, sender: "client", name: "Amy Chen", body: "Hello, I got a letter from opposing counsel today. It looks like they're requesting additional discovery. Is this normal?", time: "Yesterday, 3:22 PM", read: true, internal: false },
    { id: 2, sender: "attorney", name: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, body: "Hi Amy, yes — this is a standard part of the litigation process. I've reviewed the letter and will respond on your behalf. No action required from you at this time.", time: "Yesterday, 5:01 PM", read: true, internal: false, aiGenerated: true },
    { id: 3, sender: "client", name: "Amy Chen", body: "Thank you. I just want to make sure we're on track for April 3rd.", time: "Today, 8:30 AM", read: false, internal: false },
  ],
};

const DOCUMENTS = {
  1: [
    { id: 1, name: "Bank Statements - Jan-Dec 2023.pdf", type: "Financial", size: "2.4 MB", uploaded: "Mar 10", by: selectedMatter?.client || "Client", aiLabel: "Financial Statement", confidence: 0.96, shared: true },
    { id: 2, name: "Tax Return 2022.pdf", type: "Financial", size: "1.1 MB", uploaded: "Mar 10", by: selectedMatter?.client || "Client", aiLabel: "Tax Document", confidence: 0.98, shared: true },
    { id: 3, name: "Tax Return 2023.pdf", type: "Financial", size: "1.3 MB", uploaded: "Mar 10", by: selectedMatter?.client || "Client", aiLabel: "Tax Document", confidence: 0.98, shared: true },
    { id: 4, name: "Retainer Agreement - Johnson.pdf", type: "Contract", size: "0.4 MB", uploaded: "Feb 28", by: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, aiLabel: "Retainer Agreement", confidence: 0.99, shared: true },
    { id: 5, name: "FL 150 Income Expense Declaration.docx", type: "Court Filing", size: "0.3 MB", uploaded: "Mar 5", by: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, aiLabel: "Court Filing", confidence: 0.91, shared: false },
  ],
};

const DOC_REQUESTS = {
  1: [
    { id: 1, label: "Last 2 years of bank statements", done: true },
    { id: 2, label: "Last 2 years of tax returns", done: true },
    { id: 3, label: "Mortgage statement (most recent)", done: false },
    { id: 4, label: "Retirement account statements", done: false },
    { id: 5, label: "Any business ownership documents", done: false },
  ],
};

const INVOICES = [
  { id: 1, matterId: 1, number: "INV-2024-001", desc: "Initial retainer + consultation", amount: 2800, status: "paid", date: "Feb 28", due: "Mar 7" },
  { id: 2, matterId: 1, number: "INV-2024-008", desc: "Legal services — February", amount: 1400, status: "overdue", date: "Mar 1", due: "Mar 15" },
  { id: 3, matterId: 3, number: "INV-2024-004", desc: "Discovery phase — January", amount: 3800, status: "paid", date: "Feb 15", due: "Feb 22" },
  { id: 4, matterId: 3, number: "INV-2024-009", desc: "Deposition preparation", amount: 2200, status: "sent", date: "Mar 8", due: "Mar 22" },
  { id: 5, matterId: 4, number: "INV-2024-011", desc: "Initial case evaluation", amount: 750, status: "overdue", date: "Feb 20", due: "Mar 5" },
];

const TIMELINE = {
  1: [
    { id: 1, date: "Mar 10", type: "document", icon: "file", color: "blue", text: "Client uploaded 3 financial documents (bank statements, 2x tax returns)" },
    { id: 2, date: "Mar 8", type: "update", icon: "zap", color: "purple", text: "Case update sent to client: Asset disclosure deadline confirmed for March 20" },
    { id: 3, date: "Mar 5", type: "document", icon: "file", color: "blue", text: "Document request sent to client: bank statements, tax returns, mortgage statement" },
    { id: 4, date: "Mar 1", type: "payment", icon: "dollar", color: "green", text: "Invoice INV-2024-001 paid — $2,800 received" },
    { id: 5, date: "Feb 28", type: "message", icon: "message", color: "gray", text: "Retainer agreement signed and executed" },
    { id: 6, date: "Feb 27", type: "intake", icon: "users", color: "teal", text: "Matter opened — Client portal invitation sent to client" },
  ],
};

const aiQueue = [
  { id: 1, matterId: 1, matterTitle: "Johnson Divorce", agent: "PlainLanguageAgent", type: "Case Update", preview: "Your attorney has reviewed the financial documents you uploaded. The asset disclosure form is now being prepared and will be filed with the court before the March 20 deadline. No action is needed from you at this time.", generated: "10 min ago" },
  { id: 2, matterId: 3, matterTitle: "Chen v. Realty", agent: "MessageDraftAgent", type: "Message Draft", preview: "Hi Amy, your court date of April 3rd is confirmed and we are fully prepared. I'll send you a preparation guide this week covering what to expect on the day and how to present yourself effectively in court.", generated: "25 min ago" },
];

const DIGEST_TEXT = `Good morning, Alex. Here's your briefing for today, Tuesday March 3rd.

You have unread client messages across your active matters. Check the inbox to review and respond.

**Attention needed:**
• Johnson Divorce has 3 outstanding document requests (mortgage, retirement, business docs) — deadline in 12 days
• Chen v. Realty court date is 31 days out — motion in limine deadline is March 28
• Rodriguez matter has an overdue invoice of $750 (28 days past due)
• Park Business Acquisition needs conflict check before matter can open

**2 AI-generated items** are waiting for your approval.`;

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active: ["badge-green", "Active"],
    pending_client: ["badge-amber", "Pending Client"],
    pending_opposing: ["badge-blue", "Pending Opposing"],
    intake: ["badge-gray", "Intake"],
    closed: ["badge-gray", "Closed"],
    paid: ["badge-green", "Paid"],
    sent: ["badge-blue", "Sent"],
    overdue: ["badge-red", "Overdue"],
    draft: ["badge-gray", "Draft"],
    high: ["badge-red", "High Priority"],
    medium: ["badge-amber", "Medium"],
    low: ["badge-gray", "Low"],
  };
  const [cls, label] = map[status] || ["badge-gray", status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const Avatar = ({ name, size = 32, color = "blue" }) => {
  const colors = { blue: ["#EFF6FF", "#2563EB"], navy: ["#EFF6FF", "#0F2240"], purple: ["#F5F3FF", "#7C3AED"], teal: ["#F0FDFA", "#0D9488"], amber: ["#FFFBEB", "#D97706"], green: ["#ECFDF5", "#059669"] };
  const [bg, fg] = colors[color] || colors.blue;
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("");
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-sans)" }}>
      {initials}
    </div>
  );
};

const Tooltip = ({ children, tip }) => (
  <div className="tooltip" data-tip={tip}>{children}</div>
);

// ─── AI DRAFT MODAL ───────────────────────────────────────────────────────────
const AIDraftModal = ({ draft, onApprove, onEdit, onReject, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft.preview);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,34,64,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="card fade-in" style={{ width: 560, maxHeight: "80vh", overflow: "auto", padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--purple-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="cpu" size={18} color="var(--purple)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>AI Review Required</div>
              <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{draft.agent} · {draft.matterTitle}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="ai-card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span className="ai-badge"><Icon name="cpu" size={11} color="var(--purple)" />AI Generated</span>
            <span style={{ fontSize: 12, color: "var(--gray-500)" }}>· {draft.type} · Review before sending</span>
          </div>
          {editing ? (
            <textarea className="input textarea" value={text} onChange={e => setText(e.target.value)} style={{ minHeight: 120, fontSize: 14, lineHeight: 1.6 }} />
          ) : (
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--gray-700)" }}>{text}</p>
          )}
        </div>
        <div style={{ background: "var(--amber-pale)", border: "1px solid #FDE68A", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 18, fontSize: 12.5, color: "#92400E", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon name="alert-circle" size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          This AI-generated content will only be sent after your explicit approval. You are responsible for the final content as the attorney of record.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-danger btn-sm" onClick={onReject}>Reject</button>
          {editing
            ? <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Preview</button>
            : <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><Icon name="edit" size={13} />Edit</button>
          }
          <button className="btn btn-primary btn-sm" onClick={() => onApprove(text)}><Icon name="check" size={13} />Approve & Send</button>
        </div>
      </div>
    </div>
  );
};


// ─── VIDEO CALL COMPONENT ─────────────────────────────────────────────────────
const VideoCall = ({ contact, onClose, isClient }) => {
  const [callState, setCallState] = useState("lobby"); // lobby | connecting | active | ended
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [callMsg, setCallMsg] = useState("");
  const [callChats, setCallChats] = useState([
    { sender: "system", text: "Meeting started — messages visible to all participants" }
  ]);
  const [duration, setDuration] = useState(0);
  const [remoteActive, setRemoteActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [permError, setPermError] = useState(null);
  const [summaryText, setSummaryText] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);
  const pcRef = useRef(null);

  // Start local camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: camOn, audio: micOn });
      localStreamRef.current = stream;
      // Retry attaching stream to video element with small delay
      const attachStream = () => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        } else {
          setTimeout(attachStream, 100);
        }
      };
      attachStream();
      return stream;
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermError("Camera/microphone access was denied. Please allow access in your browser and try again.");
      } else if (err.name === "NotFoundError") {
        setPermError("No camera or microphone found on this device.");
      } else if (err.name === "NotReadableError") {
        setPermError("Camera is already in use by another application. Please close it and try again.");
      } else {
        setPermError("Could not access camera: " + err.message);
      }
      return null;
    }
  };

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
  };

  const joinCall = async () => {
    setCallState("connecting");
    const stream = await startCamera();
    if (!stream) { setCallState("lobby"); return; }

    // Simulate remote joining after 2.5 seconds
    setTimeout(() => {
      setCallState("active");
      setRemoteActive(true);
      // Start duration timer
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }, 2500);
  };

  const endCall = async () => {
    clearInterval(timerRef.current);
    stopCamera();
    setCallState("ended");
    // Generate AI summary
    setShowSummary(true);
    setSummaryLoading(true);
    try {
      const BASE = import.meta?.env?.VITE_API_URL || "https://api.counselbridge.me";
      const { access } = { access: localStorage.getItem("cb_token") };
      const resp = await fetch(`${BASE}/api/ai/meeting-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}) },
        body: JSON.stringify({
          attorneyName: contact?.myName || "the attorney",
          clientName: contact?.name || "the client",
          matter: contact?.matter || "their legal matter",
          durationSeconds: duration
        })
      });
      const data = await resp.json();
      setSummaryText(data?.summary || "Meeting completed. Please add your notes manually.");
    } catch {
      setSummaryText("Meeting completed (" + fmt(duration) + "). Please add your notes manually.");
    }
    setSummaryLoading(false);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setMicOn(m => !m);
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setCamOn(c => !c);
  };

  const toggleScreen = async () => {
    if (screenSharing) {
      // Stop screen share, revert to camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => null);
      if (stream && localVideoRef.current) {
        stopCamera();
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;
      }
      setScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
          localStreamRef.current = screenStream;
        }
        screenStream.getVideoTracks()[0].onended = () => setScreenSharing(false);
        setScreenSharing(true);
      } catch { /* user cancelled */ }
    }
  };

  const sendCallMsg = () => {
    if (!callMsg.trim()) return;
    setCallChats(c => [...c, { sender: isClient ? "client" : "attorney", text: callMsg }]);
    setCallMsg("");
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      stopCamera();
    };
  }, []);

  // Re-attach stream to video element whenever callState becomes active
  useEffect(() => {
    if (callState === "active" && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [callState]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
  };

  // ── LOBBY ──
  if (callState === "lobby") return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,18,36,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#0F1E33", borderRadius: 20, padding: "40px 36px", width: 440, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 72, height: 72, background: "rgba(37,99,235,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "2px solid rgba(37,99,235,0.4)" }}>
          <Icon name="video" size={30} color="#60A5FA" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6, fontFamily: "var(--font-serif)" }}>
          {isClient ? "Join Your Consultation" : `Call with ${contact?.name || "Client"}`}
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28 }}>
          {isClient ? `with ${contact?.name || "Your Attorney"}` : contact?.matter || "Video Consultation"}
        </div>
        {permError && (
          <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13.5, color: "#FCA5A5", textAlign: "left" }}>
            {permError}
          </div>
        )}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "16px", marginBottom: 24, display: "flex", gap: 20, justifyContent: "center" }}>
          <div style={{ display: "flex", flex: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: micOn ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.15)", border: micOn ? "1.5px solid rgba(5,150,105,0.5)" : "1.5px solid rgba(220,38,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setMicOn(m => !m)}>
              <Icon name="mic" size={18} color={micOn ? "#6EE7B7" : "#FCA5A5"} />
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{micOn ? "Mic on" : "Muted"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: camOn ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.15)", border: camOn ? "1.5px solid rgba(5,150,105,0.5)" : "1.5px solid rgba(220,38,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setCamOn(c => !c)}>
              <Icon name="video" size={18} color={camOn ? "#6EE7B7" : "#FCA5A5"} />
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{camOn ? "Cam on" : "Cam off"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px 0", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={joinCall} style={{ flex: 2, padding: "12px 0", background: "var(--blue)", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="video" size={16} color="white" /> Join Now
          </button>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>End-to-end encrypted · Recorded only with consent</div>
      </div>
    </div>
  );

  // ── CONNECTING ──
  if (callState === "connecting") return (
    <div style={{ position: "fixed", inset: 0, background: "#060E1A", zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "2px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulse 2s infinite" }}>
          <Avatar name={contact?.name || "Client"} size={56} color="blue" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "white", marginBottom: 8, fontFamily: "var(--font-serif)" }}>Connecting…</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>Waiting for {contact?.name || "client"} to join</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)", animation: `bounce 1.4s ease infinite`, animationDelay: i * 0.2 + "s" }} />
          ))}
        </div>
        <button onClick={() => { stopCamera(); setCallState("lobby"); }} style={{ marginTop: 40, padding: "10px 28px", background: "rgba(220,38,38,0.15)", color: "#FCA5A5", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14 }}>
          Cancel
        </button>
      </div>
    </div>
  );

  // ── ACTIVE CALL ──
  if (callState === "active") return (
    <div style={{ position: "fixed", inset: 0, background: "#060E1A", zIndex: 2000, display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <div style={{ height: 52, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", padding: "0 20px", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, background: "var(--blue)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="shield" size={14} color="white" />
        </div>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "white" }}>CounselBridge</span>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{contact?.name || "Client"}</span>
        {contact?.matter && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>· {contact.matter}</span>}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.4)", borderRadius: 20, padding: "4px 12px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12.5, color: "#6EE7B7", fontWeight: 600 }}>{fmt(duration)}</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="shield" size={12} color="rgba(255,255,255,0.3)" />
          Encrypted
        </div>
      </div>

      {/* Video area */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Remote video (large) */}
        <div style={{ flex: 1, background: "#0C1525", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {remoteActive ? (
            <video ref={remoteVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : null}
          {/* Remote placeholder — simulated participant */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0C1A2E 0%, #142236 100%)" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "3px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Avatar name={contact?.name || "Client"} size={72} color="teal" />
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", fontWeight: 600, fontFamily: "var(--font-serif)" }}>{contact?.name || "Client"}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Camera off</div>
          </div>
          {/* Participant name overlay */}
          <div style={{ position: "absolute", bottom: 14, left: 16, background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "4px 10px", fontSize: 12.5, color: "white", backdropFilter: "blur(4px)" }}>
            {contact?.name || "Client"}
          </div>
        </div>

        {/* Local video (PIP) */}
        <div style={{ position: "absolute", top: 16, right: chatOpen ? 316 : 16, width: 180, height: 120, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", transition: "right 0.3s ease", zIndex: 10 }}>
          {camOn ? (
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#1a2a40", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Avatar name={contact?.myName || "You"} size={44} color="blue" />
            </div>
          )}
          <div style={{ position: "absolute", bottom: 6, left: 8, fontSize: 11, color: "white", background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 4 }}>
            {`You (${contact?.myName || "You"})`}
          </div>
          {!micOn && (
            <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(220,38,38,0.8)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="mic" size={11} color="white" />
            </div>
          )}
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div style={{ width: 300, background: "rgba(8,16,28,0.95)", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.8)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Meeting Chat
              <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}>
                <Icon name="x" size={15} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {callChats.map((m, i) => (
                <div key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                  {m.sender === "system" ? (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11.5, padding: "4px 0" }}>{m.text}</div>
                  ) : (
                    <div style={{ background: m.sender === (isClient ? "client" : "attorney") ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 10px", color: "rgba(255,255,255,0.85)" }}>
                      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>
                        {m.sender === (isClient ? "client" : "attorney") ? "You" : contact?.name}
                      </div>
                      {m.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 6 }}>
              <input value={callMsg} onChange={e => setCallMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendCallMsg()} placeholder="Send a message..." style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: "7px 10px", color: "white", fontFamily: "var(--font-sans)", fontSize: 13, outline: "none" }} />
              <button onClick={sendCallMsg} style={{ background: "var(--blue)", border: "none", borderRadius: 7, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Icon name="send" size={14} color="white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div style={{ height: 80, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        {[
          { icon: micOn ? "mic" : "mic", label: micOn ? "Mute" : "Unmute", onClick: toggleMic, active: !micOn, danger: !micOn },
          { icon: "video", label: camOn ? "Stop Video" : "Start Video", onClick: toggleCam, active: !camOn, danger: !camOn },
          { icon: "layers", label: screenSharing ? "Stop Share" : "Share Screen", onClick: toggleScreen, active: screenSharing, highlight: screenSharing },
          { icon: "message", label: "Chat", onClick: () => setChatOpen(c => !c), active: chatOpen, highlight: chatOpen },
        ].map(ctrl => (
          <button key={ctrl.label} onClick={ctrl.onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: ctrl.danger ? "rgba(220,38,38,0.2)" : ctrl.highlight ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.08)", border: ctrl.danger ? "1px solid rgba(220,38,38,0.4)" : ctrl.highlight ? "1px solid rgba(37,99,235,0.4)" : "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 18px", cursor: "pointer", minWidth: 72, transition: "all 0.15s" }}>
            <Icon name={ctrl.icon} size={20} color={ctrl.danger ? "#FCA5A5" : ctrl.highlight ? "#93C5FD" : "rgba(255,255,255,0.8)"} />
            <span style={{ fontSize: 11, color: ctrl.danger ? "#FCA5A5" : ctrl.highlight ? "#93C5FD" : "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }}>{ctrl.label}</span>
          </button>
        ))}

        <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

        {/* End call */}
        <button onClick={endCall} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "rgba(220,38,38,0.85)", border: "none", borderRadius: 12, padding: "10px 24px", cursor: "pointer", minWidth: 80, transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#DC2626"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(220,38,38,0.85)"}>
          <Icon name="phone" size={20} color="white" style={{ transform: "rotate(135deg)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-sans)" }}>End Call</span>
        </button>
      </div>
    </div>
  );

  // ── SUMMARY ──
  if (callState === "ended" && showSummary) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,18,36,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#0F1E33", borderRadius: 20, padding: "36px 32px", width: 520, maxHeight: "80vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, background: "rgba(5,150,105,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check-circle" size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "white", fontFamily: "var(--font-serif)" }}>Call Ended</div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 2 }}>· {fmt(duration)}</span>
        </div>
        <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
          With {contact?.name || "Client"} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>

        <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <Icon name="cpu" size={14} color="#A78BFA" />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Meeting Summary</span>
            {summaryLoading && <div style={{ width: 14, height: 14, border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginLeft: 4 }} />}
          </div>
          {summaryLoading ? (
            <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "8px 0" }}>
              <div className="ai-typing"><span /><span /><span /></div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>Generating summary…</span>
            </div>
          ) : (
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{summaryText}</div>
          )}
        </div>

        <div style={{ background: "rgba(215,119,0,0.12)", border: "1px solid rgba(215,119,0,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12.5, color: "#FCD34D", display: "flex", gap: 7, alignItems: "flex-start" }}>
          <Icon name="shield" size={13} color="#FCD34D" />
          This summary requires your review before being added to the matter file or shared with the client.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14 }}>
            Close
          </button>
          {!summaryLoading && (
            <button onClick={onClose} style={{ flex: 2, padding: "11px 0", background: "var(--blue)", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600 }}>
              Save to Matter File
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return null;
};

// ─── INVOICE MODAL ────────────────────────────────────────────────────────────
const InvoiceModal = ({ matters, onClose, onCreated }) => {
  const [form, setForm] = useState({ matterId: matters[0]?.id || "", description: "", amount: "", dueDate: "", sendNow: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (sendNow) => {
    if (!form.matterId || !form.description || !form.amount || !form.dueDate) { setError("Please fill in all fields."); return; }
    setSaving(true); setError("");
    try {
      const data = await InvoicesAPI.create({
        matterId: form.matterId,
        description: form.description,
        amountCents: Math.round(parseFloat(form.amount) * 100),
        dueDate: form.dueDate,
        status: sendNow ? "sent" : "draft",
      });
      if (sendNow) await InvoicesAPI.send(data.invoice.id).catch(() => {});
      onCreated(data.invoice);
    } catch (err) {
      setError(err.message || "Failed to create invoice.");
    }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,34,64,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="card fade-in" style={{ width: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>Create Invoice</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        {error && <div style={{ background: "var(--red-pale)", color: "var(--red)", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13.5, marginBottom: 14 }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label>Matter *</label>
            <select className="input select" value={form.matterId} onChange={e => set("matterId", e.target.value)}>
              {matters.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div><label>Description *</label><input className="input" placeholder="Legal services — March 2026" value={form.description} onChange={e => set("description", e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label>Amount ($) *</label><input className="input" type="number" placeholder="1800.00" value={form.amount} onChange={e => set("amount", e.target.value)} /></div>
            <div><label>Due Date *</label><input className="input" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-secondary" disabled={saving} onClick={() => handleSubmit(false)}>Save Draft</button>
            <button className="btn btn-primary" disabled={saving} onClick={() => handleSubmit(true)}><Icon name="send" size={14} />{saving ? "Creating..." : "Send to Client"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DOCUMENT UPLOAD MODAL ─────────────────────────────────────────────────────
const DocumentUploadModal = ({ matters, onClose, onUploaded, defaultMatterId }) => {
  const [matterId, setMatterId] = useState(defaultMatterId || matters[0]?.id || "");
  const [accessLevel, setAccessLevel] = useState("INTERNAL");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleUpload = async () => {
    if (!files.length) { setError("Please select at least one file."); return; }
    if (!matterId) { setError("Please select a matter."); return; }
    setUploading(true); setError("");
    try {
      const data = await DocumentsAPI.upload(matterId, Array.from(files), accessLevel);
      onUploaded(data.documents || []);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    }
    setUploading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,34,64,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="card fade-in" style={{ width: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>Upload Documents</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        {error && <div style={{ background: "var(--red-pale)", color: "var(--red)", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13.5, marginBottom: 14 }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label>Matter *</label>
            <select className="input select" value={matterId} onChange={e => setMatterId(e.target.value)}>
              {matters.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div><label>Visibility</label>
            <select className="input select" value={accessLevel} onChange={e => setAccessLevel(e.target.value)}>
              <option value="INTERNAL">Internal only (attorney & staff)</option>
              <option value="CLIENT">Shared with client</option>
            </select>
          </div>
          <div
            style={{ border: "2px dashed var(--gray-300)", borderRadius: "var(--radius-md)", padding: 24, textAlign: "center", cursor: "pointer", background: files.length ? "var(--blue-pale)" : "var(--gray-50)" }}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); setFiles(e.dataTransfer.files); }}>
            <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={e => setFiles(e.target.files)} />
            <Icon name="upload" size={28} color="var(--gray-400)" />
            <p style={{ fontSize: 14, color: "var(--gray-600)", marginTop: 8 }}>
              {files.length ? `${files.length} file(s) selected` : "Click or drag files here"}
            </p>
            <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>PDF, DOCX, JPG, PNG, ZIP up to 50MB</p>
          </div>
          {files.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Array.from(files).map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
                  <Icon name="file" size={13} color="var(--blue)" />
                  <span style={{ flex: 1, color: "var(--gray-700)" }}>{f.name}</span>
                  <span style={{ color: "var(--gray-400)" }}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={uploading || !files.length} onClick={handleUpload}>
              <Icon name="upload" size={14} />{uploading ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── NEW MATTER MODAL ─────────────────────────────────────────────────────────
const NewMatterModal = ({ onClose, onCreated, currentUser }) => {
  const [form, setForm] = useState({
    clientFirstName: "", clientLastName: "", clientEmail: "", clientPhone: "",
    title: "", practiceArea: "Family Law", retainerAmount: "", billingType: "Hourly", notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.clientFirstName || !form.clientEmail || !form.title) {
      setError("Please fill in client name, email, and matter title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = await MattersAPI.create({
        title: form.title,
        practiceArea: form.practiceArea,
        notes: form.notes,
        billingType: form.billingType,
        retainerAmount: form.retainerAmount ? parseFloat(form.retainerAmount) : 0,
        clientEmail: form.clientEmail,
        clientFirstName: form.clientFirstName,
        clientLastName: form.clientLastName,
        clientPhone: form.clientPhone,
      });
      onCreated(data.matter);
    } catch (err) {
      setError(err.message || "Failed to create matter. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,34,64,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="card fade-in" style={{ width: 560, maxHeight: "85vh", overflow: "auto", padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: "var(--navy)", fontFamily: "var(--font-serif)" }}>Open New Matter</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--gray-500)", marginBottom: 24 }}>Fill in the details below. A client portal invitation will be sent automatically.</p>

        {error && <div style={{ background: "var(--red-pale)", color: "var(--red)", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13.5, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label>Client First Name *</label><input className="input" placeholder="Sarah" value={form.clientFirstName} onChange={e => set("clientFirstName", e.target.value)} /></div>
            <div><label>Client Last Name</label><input className="input" placeholder="Johnson" value={form.clientLastName} onChange={e => set("clientLastName", e.target.value)} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label>Client Email *</label><input className="input" type="email" placeholder="client@email.com" value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} /></div>
            <div><label>Client Phone</label><input className="input" placeholder="(415) 555-0100" value={form.clientPhone} onChange={e => set("clientPhone", e.target.value)} /></div>
          </div>
          <div><label>Matter Title *</label><input className="input" placeholder="e.g. Johnson Divorce Proceeding" value={form.title} onChange={e => set("title", e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label>Practice Area</label>
              <select className="input select" value={form.practiceArea} onChange={e => set("practiceArea", e.target.value)}>
                <option>Family Law</option><option>Estate Planning</option><option>Litigation</option>
                <option>Corporate</option><option>Personal Injury</option><option>Real Estate</option><option>Criminal Defense</option>
              </select>
            </div>
            <div><label>Billing Type</label>
              <select className="input select" value={form.billingType} onChange={e => set("billingType", e.target.value)}>
                <option>Hourly</option><option>Flat fee</option><option>Contingency</option>
              </select>
            </div>
          </div>
          <div><label>Retainer Amount</label><input className="input" placeholder="$0.00" value={form.retainerAmount} onChange={e => set("retainerAmount", e.target.value)} /></div>
          <div><label>Initial Notes (internal)</label><textarea className="input textarea" placeholder="Brief description of the matter and client situation..." value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
          <div style={{ background: "var(--blue-pale)", border: "1px solid var(--blue-pale2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--blue)" }}>
            <Icon name="mail" size={13} color="var(--blue)" style={{ display: "inline", marginRight: 6 }} />
            A portal invitation email will be sent to the client automatically upon saving.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
              <Icon name="briefcase" size={14} />{saving ? "Creating..." : "Open Matter & Invite Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MATTER DETAIL ─────────────────────────────────────────────────────────
const MatterDetail = ({ matter, messages, showInternal, setShowInternal, invoices, setVideoCallContact, setShowVideoCall, currentUser, setShowInvoiceModal, setSelectedMatter, matterTab, setMatterTab, aiDraft, setAiDraft, newMsg, setNewMsg, generateAIDraft, sendMessage, aiTyping, setShowAIModal, setShowUploadModal, msgEndRef }) => {
  const matterMsgs = (messages[matter.id] || []);
  const visibleMsgs = showInternal ? matterMsgs : matterMsgs.filter(m => !m.internal);
  const docs = matter?.documents || [];
  const reqs = matter?.docRequests || [];
  const inv = invoices.filter(i => i.matterId === matter.id);
  const tl = matter?.events || [];

  return (
    <div className="fade-in" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Matter header */}
      <div style={{ background: "var(--white)", borderBottom: "1px solid var(--gray-200)", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 6, paddingLeft: 0 }} onClick={() => setSelectedMatter(null)}>
              <Icon name="arrow_left" size={14} />Back to matters
            </button>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--navy)", marginBottom: 4 }}>{matter.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{matter.ref}</span>
              <span style={{ color: "var(--gray-300)" }}>·</span>
              <span style={{ fontSize: 12.5, color: "var(--gray-500)" }}>{matter.practice}</span>
              <span style={{ color: "var(--gray-300)" }}>·</span>
              <StatusBadge status={matter.status} />
              {matter.urgency === "high" && <StatusBadge status="high" />}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setVideoCallContact({ name: matter.client, matter: matter.title, myName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You" }); setShowVideoCall(true); }}><Icon name="video" size={14} />Schedule Call</button>
            <button className="btn btn-primary btn-sm"><Icon name="edit" size={14} />Update Status</button>
          </div>
        </div>
        <div className="tab-bar">
          {["overview", "messages", "documents", "timeline", "billing"].map(t => (
            <button key={t} className={`tab ${matterTab === t ? "active" : ""}`} onClick={() => setMatterTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "messages" && matterMsgs.filter(m => !m.read).length > 0 && (
                <span className="badge badge-red" style={{ marginLeft: 5, padding: "1px 5px", fontSize: 10 }}>{matterMsgs.filter(m => !m.read).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
        {/* OVERVIEW */}
        {matterTab === "overview" && (
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Client</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={matter.client} size={44} color="teal" />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-900)" }}>{matter.client}</div>
                    <div style={{ fontSize: 13.5, color: "var(--gray-500)" }}>{matter.clientEmail}</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button className="btn btn-secondary btn-sm"><Icon name="message" size={13} /></button>
                    <button className="btn btn-secondary btn-sm"><Icon name="phone" size={13} /></button>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Next Steps</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "var(--blue-pale)", border: "1.5px solid var(--blue-pale2)", borderRadius: "var(--radius-md)", padding: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>👤 Client sees</div>
                    <p style={{ fontSize: 13.5, color: "var(--gray-700)", lineHeight: 1.6 }}>{matter.nextStep}</p>
                    <button className="btn btn-sm" style={{ background: "var(--blue)", color: "white", marginTop: 10, fontSize: 12 }}>
                      <Icon name="cpu" size={12} />Generate Update
                    </button>
                  </div>
                  <div style={{ background: "var(--amber-pale)", border: "1.5px solid #FDE68A", borderRadius: "var(--radius-md)", padding: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>🔒 Internal only</div>
                    <p style={{ fontSize: 13.5, color: "var(--gray-700)", lineHeight: 1.6 }}>{matter.nextStepInternal}</p>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Document Progress</div>
                {reqs.length > 0 ? (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--gray-500)", marginBottom: 5 }}>
                        <span>{reqs.filter(r => r.done).length} of {reqs.length} received</span>
                        <span style={{ color: reqs.filter(r => !r.done).length > 0 ? "var(--amber)" : "var(--green)" }}>{reqs.filter(r => !r.done).length > 0 ? `${reqs.filter(r => !r.done).length} outstanding` : "All received ✓"}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${(reqs.filter(r => r.done).length / reqs.length) * 100}%`, background: reqs.filter(r => !r.done).length > 0 ? "var(--amber)" : "var(--green)" }} /></div>
                    </div>
                    {reqs.map(req => (
                      <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13.5 }}>
                        <Icon name={req.done ? "check-circle" : "alert-circle"} size={15} color={req.done ? "var(--green)" : "var(--amber)"} />
                        <span style={{ color: req.done ? "var(--gray-500)" : "var(--gray-700)", textDecoration: req.done ? "line-through" : "none" }}>{req.label}</span>
                      </div>
                    ))}
                  </>
                ) : <p style={{ fontSize: 13.5, color: "var(--gray-400)" }}>No document requests for this matter</p>}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Key Dates</div>
                {matter.nextDeadline ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--red-pale)", borderRadius: "var(--radius-sm)", border: "1px solid #FECACA" }}>
                    <Icon name="clock" size={16} color="var(--red)" />
                    <span style={{ fontSize: 13.5, color: "#991B1B", fontWeight: 500 }}>{matter.nextDeadline}</span>
                  </div>
                ) : <p style={{ fontSize: 13.5, color: "var(--gray-400)" }}>No upcoming deadlines</p>}
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center", fontSize: 12 }}><Icon name="plus" size={12} />Add Deadline</button>
                </div>
              </div>

              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Billing Summary</div>
                {[["Retainer", `$${matter.retainer.toLocaleString()}`], ["Billed", `$${inv.reduce((s,i) => s + i.amount, 0).toLocaleString()}`], ["Collected", `$${matter.paid.toLocaleString()}`], ["Outstanding", `$${inv.filter(i => i.status !== "paid").reduce((s,i) => s + i.amount, 0).toLocaleString()}`]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--gray-100)", fontSize: 13.5 }}>
                    <span style={{ color: "var(--gray-500)" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: k === "Outstanding" && inv.filter(i => i.status !== "paid").length > 0 ? "var(--red)" : "var(--gray-800)" }}>{v}</span>
                  </div>
                ))}
                <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 12, fontSize: 12 }} onClick={() => setShowInvoiceModal(true)}><Icon name="plus" size={12} />Create Invoice</button>
              </div>

              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Matter Team</div>
                {[{ name: matter.attorney, role: "Lead Attorney", color: "blue" }, { name: "Priya Patel", role: "Paralegal", color: "teal" }].map(m => (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                    <Avatar name={m.name} size={28} color={m.color} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-800)" }}>{m.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{m.role}</div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 6, fontSize: 12 }}><Icon name="plus" size={12} />Add team member</button>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {matterTab === "messages" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 260px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button className={`btn btn-sm ${!showInternal ? "btn-primary" : "btn-secondary"}`} onClick={() => setShowInternal(false)}>Client Thread</button>
                <button className={`btn btn-sm ${showInternal ? "btn-primary" : "btn-secondary"}`} onClick={() => setShowInternal(true)}>🔒 Internal Notes</button>
              </div>
              {aiTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--purple)" }}>
                  <div className="ai-typing"><span /><span /><span /></div>
                  AI is drafting...
                </div>
              )}
            </div>
            <div className="card" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="scroll-y" style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleMsgs.map(msg => (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "attorney" ? "flex-end" : "flex-start", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: msg.sender === "attorney" ? 0 : 4, paddingRight: msg.sender === "attorney" ? 4 : 0 }}>
                      {msg.sender !== "attorney" && <Avatar name={msg.name} size={22} color={msg.sender === "staff" ? "amber" : "teal"} />}
                      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{msg.name} · {msg.time}</span>
                      {msg.sender === "attorney" && msg.aiGenerated && <span className="ai-badge"><Icon name="cpu" size={10} color="var(--purple)" />AI</span>}
                    </div>
                    <div className={`msg-bubble ${msg.sender === "attorney" ? "sent" : msg.internal ? "internal" : "received"}`}>
                      {msg.body}
                    </div>
                    {msg.sender !== "attorney" && !msg.read && (
                      <span style={{ fontSize: 11, color: "var(--blue)" }}>● New</span>
                    )}
                  </div>
                ))}
                {aiDraft && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span className="ai-badge"><Icon name="cpu" size={10} color="var(--purple)" />AI Draft — review before sending</span>
                    <div className="msg-bubble sent" style={{ background: "linear-gradient(135deg, #7C3AED, #2563EB)", opacity: 0.85, border: "2px dashed rgba(255,255,255,0.3)" }}>
                      {aiDraft}
                    </div>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid var(--gray-200)" }}>
                {showInternal && (
                  <div style={{ background: "var(--amber-pale)", border: "1px solid #FDE68A", borderRadius: "var(--radius-sm)", padding: "6px 10px", marginBottom: 8, fontSize: 12, color: "#92400E", display: "flex", gap: 6, alignItems: "center" }}>
                    <Icon name="lock" size={12} color="#D97706" />
                    Internal note — not visible to client
                  </div>
                )}
                {aiDraft ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="btn btn-danger btn-sm" onClick={() => setAiDraft("")}><Icon name="x" size={13} />Dismiss</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setNewMsg(aiDraft); setAiDraft(""); }}><Icon name="edit" size={13} />Edit</button>
                    <button className="btn btn-primary btn-sm" onClick={sendMessage}><Icon name="send" size={13} />Send as-is</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <textarea className="input textarea" style={{ flex: 1, minHeight: 60, resize: "none", fontSize: 13.5 }} placeholder={showInternal ? "Add an internal note..." : "Write a message to the client..."} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button className="btn btn-purple btn-sm" onClick={generateAIDraft} title="Generate AI Draft"><Icon name="cpu" size={14} /></button>
                      <button className="btn btn-secondary btn-sm"><Icon name="paperclip" size={14} /></button>
                      <button className="btn btn-secondary btn-sm"><Icon name="mic" size={14} /></button>
                      <button className="btn btn-primary btn-sm" onClick={sendMessage}><Icon name="send" size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {matterTab === "documents" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)" }}>Matter Documents</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary btn-sm"><Icon name="file" size={13} />Request Documents</button>
                <button className="btn btn-primary btn-sm"><Icon name="upload" size={13} />Upload</button>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {docs.map(doc => (
                <div key={doc.id} className="card card-hover" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: "var(--blue-pale)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="file" size={18} color="var(--blue)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)", marginBottom: 3 }}>{doc.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="ai-badge"><Icon name="tag" size={10} color="var(--purple)" />{doc.aiLabel}</span>
                      <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{Math.round(doc.confidence * 100)}% confident</span>
                      <span style={{ fontSize: 11.5, color: "var(--gray-300)" }}>·</span>
                      <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>by {doc.by}</span>
                      <span style={{ fontSize: 11.5, color: "var(--gray-300)" }}>·</span>
                      <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{doc.size}</span>
                      <span className={`badge ${doc.shared ? "badge-blue" : "badge-gray"}`} style={{ fontSize: 10 }}>{doc.shared ? "Client visible" : "Internal"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-ghost btn-sm"><Icon name="eye" size={14} /></button>
                    <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE */}
        {matterTab === "timeline" && (
          <div className="fade-in" style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {tl.map((ev, i) => (
                <div key={ev.id} className="timeline-item" style={{ paddingBottom: i < tl.length - 1 ? 22 : 0 }}>
                  <div className="timeline-dot" style={{ background: ev.color === "blue" ? "var(--blue-pale2)" : ev.color === "green" ? "var(--green-pale)" : ev.color === "purple" ? "var(--purple-pale)" : ev.color === "teal" ? "var(--teal-pale)" : "var(--gray-100)" }}>
                    <Icon name={ev.icon} size={14} color={ev.color === "blue" ? "var(--blue)" : ev.color === "green" ? "var(--green)" : ev.color === "purple" ? "var(--purple)" : ev.color === "teal" ? "var(--teal)" : "var(--gray-500)"} />
                  </div>
                  <div style={{ paddingTop: 7, flex: 1 }}>
                    <div style={{ fontSize: 14, color: "var(--gray-800)", lineHeight: 1.55, marginBottom: 2 }}>{ev.text}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{ev.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING */}
        {matterTab === "billing" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)" }}>Invoices & Payments</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowInvoiceModal(true)}><Icon name="plus" size={13} />New Invoice</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {inv.map(invoice => (
                <div key={invoice.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, background: invoice.status === "paid" ? "var(--green-pale)" : invoice.status === "overdue" ? "var(--red-pale)" : "var(--blue-pale)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="dollar" size={18} color={invoice.status === "paid" ? "var(--green)" : invoice.status === "overdue" ? "var(--red)" : "var(--blue)"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-800)", marginBottom: 2 }}>{invoice.desc}</div>
                    <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{invoice.number} · Created {invoice.date} · Due {invoice.due}</div>
                  </div>
                  <div style={{ textAlign: "right", marginRight: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)" }}>${invoice.amount.toLocaleString()}</div>
                  </div>
                  <StatusBadge status={invoice.status} />
                  {invoice.status !== "paid" && <button className="btn btn-secondary btn-sm"><Icon name="send" size={13} />Remind</button>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── NAV ITEM ─────────────────────────────────────────────────────────────────
const NavItem = ({ icon, label, page, badge, activePage, setActivePage, setSelectedMatter }) => (
  <div className={`nav-item ${activePage === page ? "active" : ""}`} onClick={() => { setActivePage(page); setSelectedMatter(null); }}>
    <Icon name={icon} size={16} color={activePage === page ? "white" : "rgba(255,255,255,0.6)"} />
    <span>{label}</span>
    {badge > 0 && <span className="badge-count">{badge}</span>}
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CounselBridge() {
  const [view, setView] = useState(() => {
    const token = localStorage.getItem("cb_token");
    const user = (() => { try { return JSON.parse(localStorage.getItem("cb_user")); } catch { return null; } })();
    if (token && user) return user.role === "CLIENT" ? "client" : "attorney";
    return "login";
  });
  const [loginType, setLoginType] = useState("attorney");
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [matterTab, setMatterTab] = useState("overview");
  const [showAIModal, setShowAIModal] = useState(null);
  const [aiQueue, setAiQueue] = useState([]);
  const [messages, setMessages] = useState({});
  const [newMsg, setNewMsg] = useState("");
  const [showInternal, setShowInternal] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [matters, setMatters] = useState([]);
  const [notifications, setNotifications] = useState(3);
  const [searchQ, setSearchQ] = useState("");
  const [clientMatterId] = useState(1);
  const [clientTab, setClientTab] = useState("updates");
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Hi Sarah! I'm here to help with general questions about your case process. What would you like to know?" }
  ]);
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [digestExpanded, setDigestExpanded] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallContact, setVideoCallContact] = useState(null);
  const [showNewMatterModal, setShowNewMatterModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(localStorage.getItem("cb_user")); } catch { return null; } });
  const [currentFirm, setCurrentFirm] = useState(() => { try { return JSON.parse(localStorage.getItem("cb_firm")); } catch { return null; } });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [clientMatter, setClientMatter] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [digestText, setDigestText] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [regData, setRegData] = useState({ firmName: "", firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const setReg = (k, v) => setRegData(r => ({ ...r, [k]: v }));
  const msgEndRef = useRef(null);

  useEffect(() => {
    const el = document.getElementById("cb-styles");
    if (!el) {
      const s = document.createElement("style");
      s.id = "cb-styles";
      s.textContent = css;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatHistory]);

  // Load data when view changes
  useEffect(() => {
    if (view === "attorney" && AuthAPI.isLoggedIn()) {
      setLoading(true);
      Promise.all([MattersAPI.list(), AIAPI.queue(), InvoicesAPI.list()])
        .then(([mattersRes, queueRes, invoicesRes]) => {
          const normalized = (mattersRes?.matters || []).map(normalizeMatter);
          setMatters(normalized);
          setAiQueue(normalizeAIQueue(queueRes?.queue || []));
          setInvoices(normalizeInvoices(invoicesRes?.invoices || []));
          setNotifications((queueRes?.queue || []).length);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    if (view === "client" && AuthAPI.isLoggedIn()) {
      setLoading(true);
      MattersAPI.list()
        .then(res => {
          const userMatters = res?.matters || [];
          if (userMatters.length > 0) {
            return MattersAPI.get(userMatters[0].id).then(full => {
              const normalized = normalizeMatter(full?.matter);
              setClientMatter(normalized);
              if (full?.matter?.threads) {
                const msgs = normalizeMessages(full.matter.threads, TokenStore.getUser()?.id);
                setMessages(msgs);
              }
              return InvoicesAPI.clientList();
            }).then(invRes => {
              setInvoices(normalizeInvoices(invRes?.invoices || []));
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [view]);

  // Load messages when matter selected
  useEffect(() => {
    if (selectedMatter?.id && view === "attorney" && AuthAPI.isLoggedIn()) {
      MessagesAPI.threads(selectedMatter.id).then(res => {
        if (res?.threads) {
          const msgs = normalizeMessages(res.threads, TokenStore.getUser()?.id);
          setMessages(prev => ({ ...prev, ...msgs }));
          const firstThread = res.threads.find(t => !t.isInternal);
          const internalThread = res.threads.find(t => t.isInternal);
          if (firstThread) setSelectedMatter(m => ({ ...m, threadId: firstThread.id, internalThreadId: internalThread?.id }));
        }
      }).catch(console.error);
    }
  }, [selectedMatter?.id]);

  const generateAIDraft = async () => {
    if (!selectedMatter) return;
    setAiTyping(true);
    setAiDraft("");
    try {
      const res = await AIAPI.draftMessage(selectedMatter.id, "Recent client messages");
      setAiDraft(res?.draft || "I've reviewed your recent message and wanted to provide an update on your matter. Please feel free to reach out if you have any questions.");
    } catch {
      setAiDraft("I've reviewed your recent message and wanted to provide an update on your matter. Please feel free to reach out if you have any questions.");
    }
    setAiTyping(false);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() && !aiDraft.trim()) return;
    const body = aiDraft || newMsg;
    const threadId = showInternal ? selectedMatter?.internalThreadId : selectedMatter?.threadId;
    const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Attorney";
    const newMessages = { ...messages };
    if (!newMessages[selectedMatter.id]) newMessages[selectedMatter.id] = [];
    newMessages[selectedMatter.id] = [...newMessages[selectedMatter.id], {
      id: Date.now(), sender: "attorney", name: userName, body, time: "Just now", read: true, internal: showInternal, aiGenerated: !!aiDraft
    }];
    setMessages(newMessages);
    setNewMsg("");
    setAiDraft("");
    if (threadId) MessagesAPI.send(threadId, body, showInternal).catch(console.error);
  };

  const sendClientChat = async () => {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg;
    setChatMsg("");
    setChatHistory(h => [...h, { role: "user", text: userMsg }]);
    setAiChatLoading(true);
    try {
      const res = await AIAPI.clientChat(userMsg, chatHistory.map(h => ({ role: h.role === "ai" ? "assistant" : "user", content: h.text })));
      setChatHistory(h => [...h, { role: "ai", text: res?.response || "I'm sorry, I couldn't process that. Please message your attorney directly." }]);
    } catch {
      setChatHistory(h => [...h, { role: "ai", text: "I'm having trouble connecting right now. Please message your attorney directly for assistance." }]);
    }
    setAiChatLoading(false);
  };

  const approveAI = async (id) => {
    try { await AIAPI.approve(id); } catch {}
    setAiQueue(q => q.filter(i => i.id !== id));
    setShowAIModal(null);
    setNotifications(n => Math.max(0, n - 1));
  };

  const rejectAI = async (id) => {
    try { await AIAPI.reject(id); } catch {}
    setAiQueue(q => q.filter(i => i.id !== id));
    setShowAIModal(null);
  };

  const handleLogout = async () => {
    await AuthAPI.logout();
    setCurrentUser(null); setCurrentFirm(null);
    setMatters([]); setMessages({}); setInvoices([]); setAiQueue([]);
    setView("login");
  };

  const filteredMatters = matters.filter(m =>
    !searchQ || m.title.toLowerCase().includes(searchQ.toLowerCase()) || m.client.toLowerCase().includes(searchQ.toLowerCase()) || m.practice.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ─── LOGIN / SIGNUP SCREEN ───────────────────────────────────────────────────
  if (view === "login") {

    const handleLogin = async () => {
      if (!loginEmail.trim() || !loginPassword.trim()) { setLoginError("Please enter your email and password."); return; }
      setLoginLoading(true); setLoginError("");
      try {
        const data = await AuthAPI.login(loginEmail, loginPassword);
        setCurrentUser(data.user);
        setCurrentFirm(data.firm);
        setView(data.user.role === "CLIENT" ? "client" : "attorney");
        setActivePage("dashboard");
      } catch (err) {
        setLoginError(err.message || "Invalid email or password.");
      }
      setLoginLoading(false);
    };

    const handleSignup = async () => {
      if (!regData.firmName || !regData.firstName || !regData.email || !regData.password) { setLoginError("Please fill in all required fields."); return; }
      if (regData.password !== regData.confirmPassword) { setLoginError("Passwords do not match."); return; }
      if (regData.password.length < 8) { setLoginError("Password must be at least 8 characters."); return; }
      setLoginLoading(true); setLoginError("");
      try {
        const data = await AuthAPI.register(regData.firmName, regData.firstName, regData.lastName, regData.email, regData.password);
        setCurrentUser(data.user);
        setCurrentFirm(data.firm);
        setView("attorney");
        setActivePage("dashboard");
      } catch (err) {
        setLoginError(err.message || "Failed to create account. Please try again.");
      }
      setLoginLoading(false);
    };

    const handleMagicLink = async () => {
      if (!loginEmail.trim()) { setLoginError("Please enter your email address first."); return; }
      try {
        await AuthAPI.magicLink(loginEmail);
        setLoginError("✓ Magic link sent! Check your email.");
      } catch (err) {
        setLoginError(err.message || "Failed to send magic link.");
      }
    };

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F2240 0%, #1B3A5C 50%, #0F2240 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
        <style>{css}</style>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 80%, rgba(37,99,235,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13,148,136,0.1) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

        <div className="fade-in" style={{ width: "100%", maxWidth: authMode === "signup" ? 500 : 420 }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 42, height: 42, background: "var(--blue)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="shield" size={22} color="white" />
              </div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "white", letterSpacing: "-0.5px" }}>CounselBridge</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5 }}>Secure Legal Communication Platform</p>
          </div>

          {/* Attorney / Client toggle — only show on login */}
          {authMode === "login" && (
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-md)", padding: 4, display: "flex", marginBottom: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
              {["attorney", "client"].map(t => (
                <button key={t} onClick={() => { setLoginType(t); setLoginError(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: "var(--radius-sm)", background: loginType === t ? "var(--white)" : "transparent", color: loginType === t ? "var(--navy)" : "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", border: "none", transition: "all var(--transition)", fontFamily: "var(--font-sans)" }}>
                  {t === "attorney" ? "⚖️  Attorney / Staff" : "👤  Client"}
                </button>
              ))}
            </div>
          )}

          <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: "var(--radius-xl)", padding: "32px 28px", boxShadow: "var(--shadow-xl)" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 4 }}>
              {authMode === "signup" ? "Create your firm account" : loginType === "attorney" ? "Welcome back" : "Your secure portal"}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--gray-500)", marginBottom: 20 }}>
              {authMode === "signup" ? "Get started with a 14-day free trial — no credit card required." : loginType === "attorney" ? "Sign in to your firm workspace" : "Access your case information securely"}
            </p>

            {loginError && (
              <div style={{ background: loginError.startsWith("✓") ? "var(--green-pale)" : "var(--red-pale)", color: loginError.startsWith("✓") ? "var(--green)" : "var(--red)", border: `1px solid ${loginError.startsWith("✓") ? "#BBF7D0" : "#FECACA"}`, borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13.5, marginBottom: 16 }}>
                {loginError}
              </div>
            )}

            {authMode === "signup" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div><label>Firm Name *</label><input className="input" placeholder="Your Firm" value={regData.firmName} onChange={e => setReg("firmName", e.target.value)} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label>First Name *</label><input className="input" placeholder="Alex" value={regData.firstName} onChange={e => setReg("firstName", e.target.value)} /></div>
                  <div><label>Last Name</label><input className="input" placeholder="Rivera" value={regData.lastName} onChange={e => setReg("lastName", e.target.value)} /></div>
                </div>
                <div><label>Email Address *</label><input className="input" type="email" placeholder="alex@yourfirm.com" value={regData.email} onChange={e => setReg("email", e.target.value)} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label>Password *</label><input className="input" type="password" placeholder="Min. 8 characters" value={regData.password} onChange={e => setReg("password", e.target.value)} /></div>
                  <div><label>Confirm Password *</label><input className="input" type="password" placeholder="Repeat password" value={regData.confirmPassword} onChange={e => setReg("confirmPassword", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignup()} /></div>
                </div>
                <button className="btn btn-primary" disabled={loginLoading} style={{ width: "100%", justifyContent: "center", padding: "11px 0", fontSize: 15, borderRadius: "var(--radius-md)", marginTop: 4 }} onClick={handleSignup}>
                  {loginLoading ? "Creating account..." : <> Create Account <Icon name="arrow_right" size={16} /></>}
                </button>
                <p style={{ textAlign: "center", fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>
                  Already have an account?{" "}
                  <span style={{ color: "var(--blue)", cursor: "pointer", fontWeight: 600 }} onClick={() => { setAuthMode("login"); setLoginError(""); }}>Sign in</span>
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label>Email address</label>
                  <input className="input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key === "Enter" && handleLogin()} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label>Password</label>
                  <input className="input" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
                </div>
                <button className="btn btn-primary" disabled={loginLoading} style={{ width: "100%", justifyContent: "center", padding: "11px 0", fontSize: 15, borderRadius: "var(--radius-md)" }} onClick={handleLogin}>
                  {loginLoading ? "Signing in..." : <> Sign In Securely <Icon name="arrow_right" size={16} /></>}
                </button>
                {loginType === "client" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                      <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
                      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>or</span>
                      <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
                    </div>
                    <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", borderRadius: "var(--radius-md)" }} onClick={handleMagicLink}>
                      <Icon name="mail" size={15} /> Send me a magic link
                    </button>
                  </>
                )}
                {loginType === "attorney" && (
                  <p style={{ textAlign: "center", fontSize: 13, color: "var(--gray-500)", marginTop: 16 }}>
                    New to CounselBridge?{" "}
                    <span style={{ color: "var(--blue)", cursor: "pointer", fontWeight: 600 }} onClick={() => { setAuthMode("signup"); setLoginError(""); }}>Create a firm account</span>
                  </p>
                )}
              </>
            )}
          </div>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            Protected by 256-bit encryption · SOC 2 compliant
          </p>
        </div>
        <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", gap: 8 }}>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }} onClick={() => { setView("attorney"); setActivePage("dashboard"); }}>
            Demo (Attorney) →
          </button>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }} onClick={() => setView("client")}>
            Demo (Client) →
          </button>
        </div>
      </div>
    );
  }

      // ─── CLIENT PORTAL ─────────────────────────────────────────────────────────
  if (view === "client") {
    const matter = clientMatter;
    const docReqs = clientMatter?.docRequests || [];
    const timeline = clientMatter?.events || [];
    const clientMsgs = (messages[clientMatter?.id] || []).filter(m => !m.internal);
    const totalReqs = docReqs.length;
    const doneReqs = docReqs.filter(d => d.done || d.status === "RECEIVED").length;

    return (
      <div style={{ minHeight: "100vh", background: "var(--gray-50)", fontFamily: "var(--font-sans)" }}>
        <style>{css}</style>
        {/* VIDEO CALL */}
        {showVideoCall && (
          <VideoCall
            contact={videoCallContact}
            onClose={() => { setShowVideoCall(false); setVideoCallContact(null); }}
            isClient={true}
          />
        )}
        {/* Header */}
        <div style={{ background: "var(--white)", borderBottom: "1px solid var(--gray-200)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "var(--blue)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="shield" size={16} color="white" />
            </div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--navy)" }}>CounselBridge</span>
            <span style={{ fontSize: 12, color: "var(--gray-400)", marginLeft: 4 }}>· {currentFirm?.name || "Your Firm"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13.5, color: "var(--gray-600)" }}>{matters[0]?.client || "Your Client"}</span>
           <Avatar name="Client" size={32} color="teal" />
            <button className="btn btn-ghost btn-sm" onClick={() => setView("login")}><Icon name="log-out" size={15} /></button>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
          {/* Case card */}
          <div style={{ background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)", borderRadius: "var(--radius-xl)", padding: "28px 28px 24px", marginBottom: 20, color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)" }} />
            <div style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Your Active Case</div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, marginBottom: 10 }}>{matter.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ background: "rgba(5,150,105,0.25)", color: "#6EE7B7", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>● Active</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{matter.ref}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>·</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{matter.practice}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", padding: "14px 16px", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>What happens next</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{matter.nextStep}</p>
            </div>
          </div>

          {/* Action items */}
          {(doneReqs < totalReqs) && (
            <div className="card" style={{ padding: "16px 20px", marginBottom: 16, borderLeft: "3px solid var(--amber)", background: "var(--amber-pale)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="alert-circle" size={16} color="var(--amber)" />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#92400E" }}>Action required — {totalReqs - doneReqs} document{totalReqs - doneReqs > 1 ? "s" : ""} still needed</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                {docReqs.filter(d => !d.done).map(req => (
                  <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13.5, color: "#92400E" }}>
                    <Icon name="file" size={14} color="#D97706" />
                    {req.label}
                  </div>
                ))}
              </div>
              <button className="btn btn-sm" style={{ background: "var(--amber)", color: "white" }}>
                <Icon name="upload" size={13} />Upload Documents
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: 20 }}>
            {["updates", "messages", "documents", "billing"].map(t => (
              <button key={t} className={`tab ${clientTab === t ? "active" : ""}`} onClick={() => setClientTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "messages" && <span className="badge badge-red" style={{ marginLeft: 6, padding: "1px 6px", fontSize: 10 }}>2</span>}
              </button>
            ))}
          </div>

          {/* UPDATES TAB */}
          {clientTab === "updates" && (
            <div className="fade-in">
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {timeline.map((ev, i) => (
                  <div key={ev.id} className="timeline-item" style={{ paddingBottom: i < timeline.length - 1 ? 20 : 0 }}>
                    <div className="timeline-dot" style={{ background: ev.color === "blue" ? "var(--blue-pale2)" : ev.color === "green" ? "var(--green-pale)" : ev.color === "purple" ? "var(--purple-pale)" : ev.color === "teal" ? "var(--teal-pale)" : "var(--gray-100)" }}>
                      <Icon name={ev.icon} size={14} color={ev.color === "blue" ? "var(--blue)" : ev.color === "green" ? "var(--green)" : ev.color === "purple" ? "var(--purple)" : ev.color === "teal" ? "var(--teal)" : "var(--gray-500)"} />
                    </div>
                    <div style={{ paddingTop: 6, flex: 1 }}>
                      <div style={{ fontSize: 13.5, color: "var(--gray-700)", lineHeight: 1.55, marginBottom: 2 }}>{ev.text}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{ev.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming appointments */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gray-700)", marginBottom: 10 }}>Upcoming</div>
                <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, background: "var(--blue-pale)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="video" size={20} color="var(--blue)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 2 }}>{`Video consultation with ${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`}</div>
                    <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Today · 2:00 PM · ~30 minutes</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => { setVideoCallContact({ name: matter?.attorney || "Attorney", matter: matter?.title || "", myName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You" }); setShowVideoCall(true); }}>
                    <Icon name="video" size={13} />Join
                  </button>
                </div>
              </div>

              {/* Quick help */}
              <div style={{ marginTop: 16, background: "var(--gray-100)", borderRadius: "var(--radius-md)", padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                <Icon name="info" size={18} color="var(--gray-400)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-700)" }}>Have a question?</div>
                  <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Use the AI assistant (bottom right) for process questions, or message your attorney directly.</div>
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {clientTab === "messages" && (
            <div className="fade-in">
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Attorney"} size={28} color="blue" />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-800)" }}>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Attorney"}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{currentFirm?.name || "Your Firm"} · Your Attorney</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setVideoCallContact({ name: matter?.attorney || "Attorney", matter: matter?.title || "", myName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You" }); setShowVideoCall(true); }}><Icon name="video" size={13} />Video Call</button>
                  </div>
                </div>
                <div className="scroll-y" style={{ height: 360, padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {clientMsgs.map(msg => (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "client" ? "flex-end" : "flex-start", gap: 4 }}>
                      <div className={`msg-bubble ${msg.sender === "client" ? "sent" : "received"}`}>
                        {msg.body}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)", paddingLeft: msg.sender === "client" ? 0 : 4, paddingRight: msg.sender === "client" ? 4 : 0 }}>
                        {msg.time} {msg.aiGenerated && <span className="ai-badge" style={{ marginLeft: 4 }}><Icon name="cpu" size={9} color="var(--purple)" />AI assisted</span>}
                      </div>
                    </div>
                  ))}
                  <div ref={msgEndRef} />
                </div>
                <div style={{ padding: "12px 14px", borderTop: "1px solid var(--gray-200)", display: "flex", gap: 8 }}>
                  <input className="input" style={{ flex: 1 }} placeholder="Message your attorney..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&newMsg.trim()){ const updated={...messages}; if(!updated[1])updated[1]=[]; updated[1]=[...updated[1],{id:Date.now(),sender:"client",name:selectedMatter?.client || "Client",body:newMsg,time:"Just now",read:false,internal:false}]; setMessages(updated); setNewMsg(""); } }} />
                  <button className="btn btn-primary btn-sm" onClick={() => { if(!newMsg.trim())return; const updated={...messages}; if(!updated[1])updated[1]=[]; updated[1]=[...updated[1],{id:Date.now(),sender:"client",name:"Client",body:newMsg,time:"Just now",read:false,internal:false}]; setMessages(updated); setNewMsg(""); }}><Icon name="send" size={14} /></button>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {clientTab === "documents" && (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)" }}>Document Requests</div>
                  <span className="badge badge-amber">{totalReqs - doneReqs} outstanding</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${(doneReqs / totalReqs) * 100}%` }} /></div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>{doneReqs} of {totalReqs} completed</div>
                </div>
                {docReqs.map(req => (
                  <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: req.done ? "var(--green-pale)" : "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={req.done ? "check" : "upload"} size={12} color={req.done ? "var(--green)" : "var(--gray-400)"} />
                    </div>
                    <span style={{ fontSize: 13.5, color: req.done ? "var(--gray-400)" : "var(--gray-700)", textDecoration: req.done ? "line-through" : "none", flex: 1 }}>{req.label}</span>
                    {!req.done && <button className="btn btn-secondary btn-sm" style={{ fontSize: 11.5 }}><Icon name="upload" size={12} />Upload</button>}
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 14 }}>Shared Documents</div>
                {(clientMatter?.documents || []).filter(d => d.accessLevel === "CLIENT" || d.shared).map(doc => (
                  <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
                    <div style={{ width: 32, height: 32, background: "var(--blue-pale)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="file" size={14} color="var(--blue)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)" }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{doc.size} · {doc.uploaded}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BILLING TAB */}
          {clientTab === "billing" && (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Retainer balance */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-800)" }}>Retainer Balance</div>
                  <span className="badge badge-green">Active</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 14 }}>
                  {[["Retainer Held", "$5,000"], ["Billed to Date", "$4,200"], ["Balance Remaining", "$800"]].map(([k,v])=>(
                    <div key={k} style={{ textAlign: "center", padding: "12px 0", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)" }}>{v}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3 }}>{k}</div>
                    </div>
                  ))}
                </div>
                <div className="progress-bar" style={{ marginBottom: 6 }}>
                  <div className="progress-fill" style={{ width: "84%", background: "var(--amber)" }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>84% of retainer used · Your attorney will request a replenishment when balance falls below $500</div>
              </div>

              {/* Invoices */}
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gray-700)", marginBottom: 4 }}>Invoices</div>
              {invoices.filter(i => i.matterId === clientMatter?.id).map(inv => (
                <div key={inv.id} className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: inv.status !== "paid" ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 4 }}>{inv.desc}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{inv.number}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>Issued {inv.date}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 12.5, color: inv.status === "overdue" ? "var(--red)" : "var(--gray-400)", fontWeight: inv.status === "overdue" ? 700 : 400 }}>Due {inv.due}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>${inv.amount.toLocaleString()}</div>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                  {inv.status !== "paid" && (
                    <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 14 }}>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 10 }}>Pay securely via credit card, debit card, or bank transfer</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}><Icon name="dollar" size={14} />Pay ${inv.amount.toLocaleString()} Now</button>
                        <button className="btn btn-secondary btn-sm"><Icon name="download" size={13} />Download</button>
                      </div>
                    </div>
                  )}
                  {inv.status === "paid" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10, borderTop: "1px solid var(--gray-100)", paddingTop: 10 }}>
                      <button className="btn btn-secondary btn-sm"><Icon name="download" size={13} />Download Receipt</button>
                    </div>
                  )}
                </div>
              ))}

              {/* Payment methods */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-800)" }}>Payment Methods</div>
                  <button className="btn btn-secondary btn-sm"><Icon name="plus" size={13} />Add Card</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>
                  <div style={{ width: 40, height: 26, background: "var(--navy)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "white", letterSpacing: "0.05em" }}>VISA</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)" }}>Visa ending in 4242</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)" }}>Expires 09/27</div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>Default</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat bubble */}
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50 }}>
          <details style={{ position: "relative" }}>
            <summary style={{ listStyle: "none", cursor: "pointer" }}>
              <div style={{ width: 52, height: 52, background: "var(--purple)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-lg)", animation: "glow 3s infinite" }}>
                <Icon name="cpu" size={22} color="white" />
              </div>
            </summary>
            <div className="card fade-in" style={{ position: "absolute", bottom: 64, right: 0, width: 320, overflow: "hidden", boxShadow: "var(--shadow-xl)" }}>
              <div style={{ background: "var(--purple)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="cpu" size={16} color="white" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>CounselBridge AI</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginLeft: 2 }}>· Never gives legal advice</span>
              </div>
              <div className="scroll-y" style={{ height: 240, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {chatHistory.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.55, background: m.role === "user" ? "var(--blue)" : "var(--gray-100)", color: m.role === "user" ? "white" : "var(--gray-800)", borderBottomRightRadius: m.role === "user" ? 4 : 12, borderBottomLeftRadius: m.role === "ai" ? 4 : 12 }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiChatLoading && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ background: "var(--gray-100)", padding: "10px 14px", borderRadius: 12, borderBottomLeftRadius: 4 }}>
                      <div className="ai-typing"><span /><span /><span /></div>
                    </div>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>
              <div style={{ padding: "8px 10px", borderTop: "1px solid var(--gray-200)", display: "flex", gap: 6 }}>
                <input className="input" style={{ flex: 1, fontSize: 13, padding: "7px 10px" }} placeholder="Ask a process question..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendClientChat()} />
                <button className="btn btn-primary btn-sm" onClick={sendClientChat}><Icon name="send" size={13} /></button>
              </div>
            </div>
          </details>
        </div>
      </div>
    );
  }

  // ─── ATTORNEY WORKSPACE ────────────────────────────────────────────────────
  // ─── MAIN LAYOUT ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <style>{css}</style>

      {/* VIDEO CALL */}
      {showVideoCall && (
        <VideoCall
          contact={videoCallContact}
          onClose={() => { setShowVideoCall(false); setVideoCallContact(null); }}
          isClient={view === "client"}
        />
      )}

      {/* AI MODAL */}
      {showAIModal && (
        <AIDraftModal
          draft={showAIModal}
          onApprove={(text) => approveAI(showAIModal.id, text)}
          onReject={() => rejectAI(showAIModal.id)}
          onClose={() => setShowAIModal(null)}
        />
      )}

      {/* New Matter Modal */}
      {showUploadModal && <DocumentUploadModal matters={matters} onClose={() => setShowUploadModal(false)} onUploaded={(docs) => { setMatters(prev => prev.map(m => m.id === docs[0]?.matterId ? { ...m, documents: [...(m.documents||[]), ...docs] } : m)); setShowUploadModal(false); }} />}
      {showNewMatterModal && <NewMatterModal onClose={() => setShowNewMatterModal(false)} onCreated={(matter) => { setMatters(prev => [...prev, normalizeMatter(matter)]); setShowNewMatterModal(false); setActivePage("matters"); }} currentUser={currentUser} />}

      {/* Invoice Modal */}
      {showInvoiceModal && <InvoiceModal matters={matters} onClose={() => setShowInvoiceModal(false)} onCreated={(inv) => { setInvoices(prev => [...prev, ...normalizeInvoices([inv])]); setShowInvoiceModal(false); }} />}

      {/* SIDEBAR */}
      <div style={{ width: 224, background: "linear-gradient(180deg, var(--navy) 0%, #162d4a 100%)", display: "flex", flexDirection: "column", padding: "0 10px 16px", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "18px 10px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: "var(--blue)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="shield" size={17} color="white" />
            </div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "white", letterSpacing: "-0.3px" }}>CounselBridge</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3, paddingLeft: 2 }}>{currentFirm?.name || "Your Firm"}</div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <NavItem icon="home" label="Dashboard" page="dashboard" activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <NavItem icon="briefcase" label="Matters" page="matters" badge={matters.filter(m => m.unread > 0).length} activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <NavItem icon="inbox" label="Inbox" page="inbox" badge={5} activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <NavItem icon="calendar" label="Calendar" page="calendar" activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <NavItem icon="cpu" label="AI Queue" page="ai-queue" badge={aiQueue.length} activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <NavItem icon="file" label="Documents" page="documents" activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <NavItem icon="dollar" label="Billing" page="billing" activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <NavItem icon="users" label="Team" page="team" activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <div style={{ flex: 1 }} />
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 2px" }} />
          <NavItem icon="settings" label="Settings" page="settings" activePage={activePage} setActivePage={setActivePage} setSelectedMatter={setSelectedMatter} />
          <div className="nav-item" onClick={handleLogout} style={{ color: "rgba(255,255,255,0.5)" }}>
            <Icon name="log-out" size={16} color="rgba(255,255,255,0.5)" />
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ background: "var(--white)", borderBottom: "1px solid var(--gray-200)", height: 56, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Icon name="search" size={15} color="var(--gray-400)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input className="input" style={{ paddingLeft: 34, height: 36, fontSize: 13.5 }} placeholder="Search matters, clients, documents..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <button className="btn btn-ghost btn-sm" style={{ padding: "6px 8px" }} onClick={() => setActivePage("ai-queue")}>
              <Icon name="bell" size={18} color="var(--gray-500)" />
              {(notifications + aiQueue.length) > 0 && <span className="notif-dot" />}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, borderLeft: "1px solid var(--gray-200)" }}>
            <Avatar name={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "User"} size={30} color="blue" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)", lineHeight: 1.2 }}>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Attorney"}</div>
              <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{currentUser?.role || "Attorney"} · {currentFirm?.name || "Your Firm"}</div>
            </div>
          </div>
          <button className="btn btn-sm" style={{ background: "rgba(37,99,235,0.1)", color: "var(--blue)", border: "1px solid var(--blue-pale2)" }} onClick={() => setView("client")}>
            👤 Client View
          </button>
          <button className="btn btn-sm btn-primary" style={{ gap: 6 }} onClick={() => {
            setVideoCallContact({ name: "Client", matter: "Ad-hoc consultation", myName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You" });
            setShowVideoCall(true);
          }}>
            <Icon name="video" size={13} color="white" /> Start Call
          </button>
        </div>

        {/* Page content */}
        <div className="scroll-y" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* MATTER DETAIL */}
          {selectedMatter && activePage === "matters" && (
            <MatterDetail matter={selectedMatter} messages={messages} showInternal={showInternal} setShowInternal={setShowInternal} invoices={invoices} setVideoCallContact={setVideoCallContact} setShowVideoCall={setShowVideoCall} currentUser={currentUser} setShowInvoiceModal={setShowInvoiceModal} setSelectedMatter={setSelectedMatter} matterTab={matterTab} setMatterTab={setMatterTab} aiDraft={aiDraft} setAiDraft={setAiDraft} newMsg={newMsg} setNewMsg={setNewMsg} generateAIDraft={generateAIDraft} sendMessage={sendMessage} aiTyping={aiTyping} setShowAIModal={setShowAIModal} setShowUploadModal={setShowUploadModal} msgEndRef={msgEndRef} />
          )}

          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }} >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--navy)", marginBottom: 2 }}>Good morning, {currentUser?.firstName || "there"}</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>{new Date().toLocaleDateString("en-US", {weekday:"long",month:"long",day:"numeric",year:"numeric"})} · {matters.filter(m => m.status === "active").length} active matters</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewMatterModal(true)}><Icon name="plus" size={15} />New Matter</button>
              </div>

              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
                {[
                  { label: "Active Matters", value: matters.filter(m => m.status === "active").length, icon: "briefcase", color: "blue", sub: `${matters.length} total` },
                  { label: "Unread Messages", value: matters.reduce((s,m) => s + (m.unread||0), 0), icon: "message", color: "teal", sub: `Across ${matters.filter(m=>m.unread>0).length} matters` },
                  { label: "Pending Invoices", value: "$" + invoices.filter(i => i.status !== "paid").reduce((s,i) => s+i.amount,0).toLocaleString(), icon: "dollar", color: "amber", sub: `${invoices.filter(i=>i.status==="overdue").length} overdue` },
                  { label: "AI Queue", value: aiQueue.length, icon: "cpu", color: "purple", sub: "Needs your approval" },
                ].map(k => (
                  <div key={k.label} className="card" style={{ padding: "16px 18px", cursor: "pointer" }} onClick={() => { if(k.label === "AI Queue") setActivePage("ai-queue"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ fontSize: 12.5, color: "var(--gray-500)", fontWeight: 500 }}>{k.label}</span>
                      <div style={{ width: 32, height: 32, background: `var(--${k.color === "blue" ? "blue-pale" : k.color === "teal" ? "teal-pale" : k.color === "amber" ? "amber-pale" : "purple-pale"})`, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={k.icon} size={15} color={`var(--${k.color})`} />
                      </div>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "var(--gray-900)", lineHeight: 1.1, marginBottom: 4 }}>{k.value}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* AI Digest */}
                  <div className="ai-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="ai-badge"><Icon name="cpu" size={11} color="var(--purple)" />Daily Digest</span>
                        <span style={{ fontSize: 12, color: "var(--gray-500)" }}>Generated by AI · 7:00 AM</span>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={async () => {
                        setDigestExpanded(!digestExpanded);
                        if (!digestText && !digestExpanded) {
                          try {
                            const res = await AIAPI.dailyDigest();
                            setDigestText(res?.digest || "No digest available.");
                          } catch { setDigestText("Unable to load digest. Please try again."); }
                        }
                      }}>
                        <Icon name={digestExpanded ? "chevron_down" : "chevron_right"} size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                      {digestExpanded ? (digestText || "Loading your daily digest...") : (digestText || "").split("\n")[0] || "Click 'Expand' to generate your AI daily briefing"}
                      {!digestExpanded && <span style={{ color: "var(--blue)", cursor: "pointer", fontSize: 13 }} onClick={() => setDigestExpanded(true)}> · See full digest</span>}
                    </div>
                  </div>

                  {/* Matters list */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)" }}>Active Matters</h2>
                      <button className="btn btn-ghost btn-sm" onClick={() => setActivePage("matters")}>View all →</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {filteredMatters.slice(0, 4).map(m => (
                        <div key={m.id} className="card card-hover" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }} onClick={() => { setSelectedMatter(m); setActivePage("matters"); setMatterTab("overview"); }}>
                          <Avatar name={m.client} size={38} color={m.practice === "Family Law" ? "teal" : m.practice === "Litigation" ? "red" : m.practice === "Estate Planning" ? "purple" : "blue"} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 3 }}>{m.title}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 12.5, color: "var(--gray-500)" }}>{m.client}</span>
                              <span style={{ color: "var(--gray-300)" }}>·</span>
                              <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{m.practice}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {m.nextDeadline && (
                              <div style={{ fontSize: 12, color: "var(--red)", background: "var(--red-pale)", padding: "3px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                <Icon name="clock" size={11} color="var(--red)" />{m.nextDeadline.split("—")[0].trim()}
                              </div>
                            )}
                            <StatusBadge status={m.status} />
                            {m.unread > 0 && <span className="badge badge-red">{m.unread} new</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* AI Queue */}
                  {aiQueue.length > 0 && (
                    <div className="card" style={{ padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", display: "flex", gap: 6, alignItems: "center" }}>
                          <Icon name="cpu" size={15} color="var(--purple)" />
                          AI Approval Queue
                          <span className="badge badge-purple">{aiQueue.length}</span>
                        </div>
                      </div>
                      {aiQueue.map(item => (
                        <div key={item.id} style={{ padding: "10px 12px", background: "var(--purple-pale)", borderRadius: "var(--radius-sm)", marginBottom: 8, border: "1px solid #DDD6FE" }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--purple)", marginBottom: 4 }}>{item.type} · {item.matterTitle}</div>
                          <div style={{ fontSize: 12.5, color: "var(--gray-600)", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.preview}</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-sm btn-danger" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={() => rejectAI(item.id)}>Reject</button>
                            <button className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={() => setShowAIModal(item)}><Icon name="eye" size={11} />Review</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upcoming */}
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 12 }}>Upcoming</div>
                    {[
                      { label: `Video Call — ${matters[0]?.client || "Client"}`, date: "Today 2:00 PM", icon: "video", color: "blue", onClick: () => { setVideoCallContact({ name: selectedMatter?.client || "Client", matter: "Johnson Divorce Proceeding", myName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You" }); setShowVideoCall(true); } },
                      { label: "Court Date — Amy Chen", date: "Apr 3, 9:00 AM", icon: "briefcase", color: "red" },
                      { label: "Document deadline — Johnson", date: "Mar 15", icon: "clock", color: "amber" },
                    ].map((ev, i) => (
                      <div key={i} onClick={ev.onClick} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--gray-100)" : "none", alignItems: "center", cursor: ev.onClick ? "pointer" : "default" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: `var(--${ev.color === "blue" ? "blue-pale" : ev.color === "red" ? "red-pale" : "amber-pale"})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name={ev.icon} size={13} color={`var(--${ev.color})`} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-800)" }}>{ev.label}</div>
                          <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{ev.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick stats */}
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 12 }}>This Month</div>
                    {[["Matters opened", "3"], ["Messages sent", "47"], ["Documents shared", "12"], ["Invoices paid", "$6,600"], ["Avg response time", "2.4 hrs"]].map(([k,v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13.5, borderBottom: "1px solid var(--gray-100)" }}>
                        <span style={{ color: "var(--gray-500)" }}>{k}</span>
                        <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MATTERS LIST */}
          {activePage === "matters" && !selectedMatter && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)" }}>Matters</h1>
                <button className="btn btn-primary" onClick={() => setShowNewMatterModal(true)}><Icon name="plus" size={15} />New Matter</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {["All", "Active", "Pending Client", "Intake", "Closed"].map(f => (
                  <button key={f} className="btn btn-secondary btn-sm" style={{ fontSize: 12.5 }}>{f}</button>
                ))}
                <div style={{ flex: 1 }} />
                <input className="input" style={{ width: 220, height: 34, fontSize: 13 }} placeholder="Search matters..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredMatters.map(m => (
                  <div key={m.id} className="card card-hover" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }} onClick={() => { setSelectedMatter(m); setMatterTab("overview"); }}>
                    <Avatar name={m.client} size={44} color={m.practice === "Family Law" ? "teal" : m.practice === "Litigation" ? "red" : m.practice === "Estate Planning" ? "purple" : "blue"} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-900)" }}>{m.title}</span>
                        {m.urgency === "high" && <span className="badge badge-red" style={{ fontSize: 10 }}>Urgent</span>}
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "var(--gray-500)" }}>{m.client}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 13, color: "var(--gray-400)" }}>{m.practice}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{m.ref}</span>
                        {m.nextDeadline && (
                          <>
                            <span style={{ color: "var(--gray-300)" }}>·</span>
                            <span style={{ fontSize: 12, color: "var(--red)", display: "flex", alignItems: "center", gap: 3 }}>
                              <Icon name="clock" size={11} color="var(--red)" />{m.nextDeadline}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <StatusBadge status={m.status} />
                      {m.unread > 0 && <span className="badge badge-red">{m.unread} new</span>}
                      <Icon name="chevron_right" size={16} color="var(--gray-300)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI QUEUE PAGE */}
          {activePage === "ai-queue" && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 4 }}>AI Approval Queue</h1>
                <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>Review and approve AI-generated content before it reaches clients. Nothing sends without your approval.</p>
              </div>
              {aiQueue.length === 0 ? (
                <div className="empty-state">
                  <Icon name="check-circle" size={48} color="var(--green)" />
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-600)", marginTop: 12 }}>All clear</div>
                  <div style={{ fontSize: 14, color: "var(--gray-400)", marginTop: 4 }}>No AI-generated content awaiting approval</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 }}>
                  {aiQueue.map(item => (
                    <div key={item.id} className="card" style={{ padding: "20px 22px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div style={{ width: 36, height: 36, background: "var(--purple-pale)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon name="cpu" size={17} color="var(--purple)" />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-800)" }}>{item.type}</div>
                            <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{item.agent} · {item.matterTitle} · {item.generated}</div>
                          </div>
                        </div>
                        <span className="ai-badge">Pending Review</span>
                      </div>
                      <div className="ai-card" style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.65 }}>{item.preview}</p>
                      </div>
                      <div style={{ background: "var(--amber-pale)", border: "1px solid #FDE68A", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 12.5, color: "#92400E", marginBottom: 14, display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <Icon name="shield" size={13} color="#D97706" />
                        This content will only be delivered after your explicit approval. As the attorney of record, you are responsible for all client communications.
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-danger btn-sm" onClick={() => rejectAI(item.id)}><Icon name="x" size={13} />Reject</button>
                        <button className="btn btn-secondary btn-sm"><Icon name="edit" size={13} />Edit before approving</button>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAIModal(item)}><Icon name="eye" size={13} />Review & Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BILLING PAGE */}
          {activePage === "billing" && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Billing</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>March 2026 · {currentFirm?.name || "Your Firm"}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm"><Icon name="download" size={14} />Export</button>
                  <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}><Icon name="plus" size={15} />New Invoice</button>
                </div>
              </div>

              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Total Billed MTD", value: "$10,950", color: "var(--gray-900)", sub: "↑ 18% vs last month" },
                  { label: "Collected MTD", value: "$6,600", color: "var(--green)", sub: "$4,350 outstanding" },
                  { label: "Overdue", value: "$2,150", color: "var(--red)", sub: "2 invoices · 28+ days" },
                  { label: "Active Retainers", value: "$8,500", color: "var(--blue)", sub: "2 matters" },
                  { label: "Avg Days to Pay", value: "8.4", color: "var(--gray-700)", sub: "Industry avg: 22 days" },
                ].map(k => (
                  <div key={k.label} className="card" style={{ padding: "16px 18px" }}>
                    <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: k.color, marginBottom: 4 }}>{k.value}</div>
                    <div style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
                <div>
                  {/* Overdue alert */}
                  <div style={{ background: "var(--red-pale)", border: "1px solid #FECACA", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="alert-circle" size={16} color="var(--red)" />
                    <span style={{ fontSize: 13.5, color: "#991B1B", fontWeight: 500 }}>2 invoices are overdue — send automated reminders?</span>
                    <button className="btn btn-sm" style={{ background: "var(--red)", color: "white", marginLeft: "auto", fontSize: 12 }}>Send Reminders</button>
                  </div>

                  {/* Filter tabs */}
                  <div className="tab-bar" style={{ marginBottom: 14 }}>
                    {["All Invoices","Overdue","Sent","Paid","Drafts"].map(t => (
                      <button key={t} className={"tab" + (t === "All Invoices" ? " active" : "")}>{t}</button>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {invoices.length === 0 ? (
                      <div className="empty-state"><Icon name="dollar" size={32} /><p>No invoices yet. Create your first invoice above.</p></div>
                    ) : invoices.map(inv => {
                      const matter = matters.find(m => m.id === inv.matterId);
                      return (
                        <div key={inv.id} className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: inv.status === "paid" ? "var(--green-pale)" : inv.status === "overdue" ? "var(--red-pale)" : "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon name="dollar" size={18} color={inv.status === "paid" ? "var(--green)" : inv.status === "overdue" ? "var(--red)" : "var(--blue)"} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 3 }}>{inv.desc}</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{inv.number}</span>
                              <span style={{ color: "var(--gray-300)" }}>·</span>
                              <span style={{ fontSize: 12.5, color: "var(--gray-500)" }}>{matter?.client || "—"}</span>
                              <span style={{ color: "var(--gray-300)" }}>·</span>
                              <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>Due {inv.due}</span>
                              {inv.status === "overdue" && <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>OVERDUE</span>}
                            </div>
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>${inv.amount.toLocaleString()}</div>
                          <StatusBadge status={inv.status} />
                          <div style={{ display: "flex", gap: 6 }}>
                            {inv.status !== "paid" && <button className="btn btn-secondary btn-sm" onClick={() => InvoicesAPI.remind(inv.id).catch(console.error)}><Icon name="send" size={12} />Remind</button>}
                            <button className="btn btn-ghost btn-sm"><Icon name="eye" size={13} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Revenue chart */}
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gray-800)", marginBottom: 14 }}>Revenue — Last 6 Months</div>
                    {[
                      { month: "Oct", amount: 8200, max: 12000 },
                      { month: "Nov", amount: 9400, max: 12000 },
                      { month: "Dec", amount: 7100, max: 12000 },
                      { month: "Jan", amount: 11200, max: 12000 },
                      { month: "Feb", amount: 9300, max: 12000 },
                      { month: "Mar", amount: 6600, max: 12000 },
                    ].map(bar => (
                      <div key={bar.month} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 11.5, color: "var(--gray-400)", width: 28 }}>{bar.month}</span>
                        <div style={{ flex: 1, height: 22, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: (bar.amount / bar.max * 100) + "%", height: "100%", background: bar.month === "Mar" ? "var(--blue-pale2)" : "var(--blue)", borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8, transition: "width 0.6s ease" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: bar.month === "Mar" ? "var(--blue)" : "white" }}>${(bar.amount/1000).toFixed(1)}k</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Retainers */}
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gray-800)", marginBottom: 14 }}>Retainer Balances</div>
                    {matters.filter(m => m.retainer > 0).map(m => (
                      <div key={m.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                          <span style={{ color: "var(--gray-700)", fontWeight: 500 }}>{m.client}</span>
                          <span style={{ color: "var(--gray-600)" }}>${(m.retainer - (m.retainer - m.paid > 0 ? m.retainer - m.paid : 0)).toLocaleString()} / ${m.retainer.toLocaleString()}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: (m.paid / m.retainer * 100) + "%", background: m.paid / m.retainer < 0.3 ? "var(--red)" : m.paid / m.retainer < 0.6 ? "var(--amber)" : "var(--green)" }} />
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--gray-400)", marginTop: 3 }}>{Math.round(m.paid / m.retainer * 100)}% depleted</div>
                      </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}><Icon name="plus" size={13} />Request Replenishment</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS PAGE */}
          {activePage === "documents" && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Documents</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>All matters · 12 files · 6.4 MB used</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm"><Icon name="file" size={13} />Request Documents</button>
                  <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}><Icon name="upload" size={15} />Upload</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
                {/* Folder tree */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, padding: "0 4px" }}>Matters</div>
                  {[
                    { label: "All Documents", count: matters.reduce((s,m)=>(m.documents||[]).length+s,0), icon: "layers" },
                    ...matters.map(m => ({ label: m.title, count: (m.documents||[]).length, icon: "folder" }))
                  ].map((folder, i) => (
                    <div key={folder.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer", background: i === 0 ? "var(--blue-pale)" : "transparent", marginBottom: 2 }}
                      onMouseEnter={e => { if(i !== 0) e.currentTarget.style.background = "var(--gray-100)"; }}
                      onMouseLeave={e => { if(i !== 0) e.currentTarget.style.background = "transparent"; }}>
                      <Icon name={folder.icon} size={14} color={i === 0 ? "var(--blue)" : "var(--gray-400)"} />
                      <span style={{ flex: 1, fontSize: 13.5, color: i === 0 ? "var(--blue)" : "var(--gray-700)", fontWeight: i === 0 ? 600 : 400 }}>{folder.label}</span>
                      <span style={{ fontSize: 11.5, color: i === 0 ? "var(--blue)" : "var(--gray-400)" }}>{folder.count}</span>
                    </div>
                  ))}

                  <div style={{ height: 1, background: "var(--gray-200)", margin: "14px 4px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, padding: "0 4px" }}>AI Labels</div>
                  {[
                    { label: "Financial", count: 4, color: "var(--green)" },
                    { label: "Court Filing", count: 2, color: "var(--red)" },
                    { label: "Contract", count: 2, color: "var(--blue)" },
                    { label: "ID Document", count: 1, color: "var(--purple)" },
                    { label: "Other", count: 3, color: "var(--gray-400)" },
                  ].map(tag => (
                    <div key={tag.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--gray-100)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: "var(--gray-600)" }}>{tag.label}</span>
                      <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{tag.count}</span>
                    </div>
                  ))}
                </div>

                {/* Document list */}
                <div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Icon name="search" size={14} color="var(--gray-400)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                      <input className="input" style={{ paddingLeft: 32, height: 36 }} placeholder="Search documents..." />
                    </div>
                    <select className="input select" style={{ width: 140, height: 36 }}>
                      <option>All types</option>
                      <option>Financial</option>
                      <option>Court Filing</option>
                      <option>Contract</option>
                    </select>
                    <select className="input select" style={{ width: 140, height: 36 }}>
                      <option>Newest first</option>
                      <option>Oldest first</option>
                      <option>Largest first</option>
                    </select>
                  </div>

                  {/* Missing doc alert */}
                  <div style={{ background: "var(--amber-pale)", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ai-badge"><Icon name="cpu" size={10} color="var(--purple)" />AI</span>
                    <span style={{ fontSize: 13, color: "#92400E" }}>MissingDocAgent detected 3 outstanding requests across 1 matter — Johnson Divorce (mortgage, retirement, business docs)</span>
                    <button className="btn btn-sm" style={{ background: "var(--amber)", color: "white", fontSize: 11.5, marginLeft: "auto" }}>View Requests</button>
                  </div>

                  {(matters.flatMap(m => m.documents || []).length === 0 ? [] : matters.flatMap(m => (m.documents || []).map(d => ({ ...d, matterTitle: m.title })))).map((doc, i) => (
                    <div key={doc.id + "-" + i} className="card card-hover" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <div style={{ width: 40, height: 40, background: doc.aiLabel === "Financial Statement" || doc.aiLabel === "Tax Document" ? "var(--green-pale)" : doc.aiLabel === "Court Filing" ? "var(--red-pale)" : doc.aiLabel === "Medical Record" ? "var(--purple-pale)" : "var(--blue-pale)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="file" size={17} color={doc.aiLabel === "Financial Statement" || doc.aiLabel === "Tax Document" ? "var(--green)" : doc.aiLabel === "Court Filing" ? "var(--red)" : doc.aiLabel === "Medical Record" ? "var(--purple)" : "var(--blue)"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                          {doc.name}
                          {doc.aiLabel === "Financial Statement" && <span className="badge badge-red" style={{ fontSize: 10 }}>Missing doc requested</span>}
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          <span className="ai-badge"><Icon name="tag" size={9} color="var(--purple)" />{doc.aiLabel}</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{Math.round(doc.confidence * 100)}%</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-300)" }}>·</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{doc.size}</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-300)" }}>·</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{doc.by}</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-300)" }}>·</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{doc.uploaded}</span>
                          <span className={"badge " + (doc.shared ? "badge-blue" : "badge-gray")} style={{ fontSize: 10 }}>{doc.shared ? "Client visible" : "Internal"}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-ghost btn-sm"><Icon name="eye" size={14} /></button>
                        <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /></button>
                        <button className="btn btn-ghost btn-sm"><Icon name="more-h" size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INBOX */}
          {activePage === "inbox" && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Inbox</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>All client messages across your matters</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["All","Unread","Flagged"].map(f => (
                    <button key={f} className="btn btn-secondary btn-sm" style={{ fontSize: 12.5 }}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Unread section */}
              <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Unread</span>
                <span className="badge badge-red">{matters.reduce((s,m)=>s+m.unread,0)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
                {matters.filter(m => m.unread > 0).flatMap(m =>
                  (messages[m.id] || []).filter(msg => !msg.read).map(msg => ({ ...msg, matter: m }))
                ).map((msg, i) => (
                  <div key={i} className="card card-hover" style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", borderLeft: "3px solid var(--blue)" }}
                    onClick={() => { setSelectedMatter(msg.matter); setActivePage("matters"); setMatterTab("messages"); }}>
                    <Avatar name={msg.name} size={40} color={msg.internal ? "amber" : "teal"} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gray-900)" }}>{msg.name}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 13, color: "var(--gray-500)" }}>{msg.matter.title}</span>
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>{msg.matter.practice}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: "var(--gray-600)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{msg.body}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      <span style={{ fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap" }}>{msg.time}</span>
                      <span className="badge badge-blue" style={{ fontSize: 10 }}>New</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* All messages section */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>All Messages</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {matters.flatMap(m => (messages[m.id] || []).filter(msg => msg.read).map(msg => ({ ...msg, matter: m }))).length === 0 ? (
                  <div className="empty-state"><Icon name="message" size={32} /><p>No messages yet. Messages will appear here once clients start communicating.</p></div>
                ) : matters.flatMap(m => (messages[m.id] || []).filter(msg => msg.read).map(msg => ({ ...msg, matter: m }))).map((msg, i) => (
                  <div key={i} className="card card-hover" style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", borderLeft: msg.internal ? "3px solid var(--amber)" : "3px solid var(--gray-200)" }}
                    onClick={() => { setSelectedMatter(msg.matter); setActivePage("matters"); setMatterTab("messages"); }}>
                    <Avatar name={msg.name} size={40} color={msg.internal ? "amber" : "blue"} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-800)" }}>{msg.name}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 13, color: "var(--gray-500)" }}>{msg.matter?.title}</span>
                        {msg.internal && <span className="badge badge-amber" style={{ fontSize: 10 }}>Internal</span>}
                      </div>
                      <div style={{ fontSize: 13.5, color: "var(--gray-500)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{msg.body}</div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap" }}>{msg.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {activePage === "calendar" && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Calendar</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>March 2026</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn btn-secondary btn-sm"><Icon name="chevron_left" size={14} /></button>
                  <button className="btn btn-secondary btn-sm"><Icon name="chevron_right" size={14} /></button>
                  <button className="btn btn-primary btn-sm" onClick={() => { setVideoCallContact({ name: selectedMatter?.client || "Client", matter: "Consultation", myName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You" }); setShowVideoCall(true); }}><Icon name="plus" size={14} />Schedule Meeting</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                {/* Calendar grid */}
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 8 }}>
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                      <div key={d} style={{ textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "var(--gray-400)", padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                    {Array.from({length: 35}, (_, i) => {
                      const day = i - 5 + 1;
                      const isToday = day === 3;
                      const calEvents = {
                        3:  [{ color: "var(--blue)", label: "Video Call 2pm" }],
                        7:  [{ color: "var(--teal)", label: "Park consult 10am" }],
                        10: [{ color: "var(--purple)", label: "Team sync" }],
                        15: [{ color: "var(--red)", label: "Doc deadline" }],
                        17: [{ color: "var(--green)", label: "Rodriguez call" }],
                        20: [{ color: "var(--amber)", label: "Martinez signing" }],
                        24: [{ color: "var(--blue)", label: "Amy Chen call" }],
                        28: [{ color: "var(--red)", label: "Motion deadline" }],
                        31: [{ color: "var(--teal)", label: "Month close" }],
                      };
                      const dayEvents = calEvents[day] || [];
                      const isWeekend = i % 7 === 0 || i % 7 === 6;
                      return (
                        <div key={i} style={{ minHeight: 64, borderRadius: "var(--radius-sm)", padding: "6px 5px", background: isToday ? "var(--blue)" : "transparent", cursor: day > 0 && day <= 31 ? "pointer" : "default", border: "1px solid transparent", transition: "all 0.15s" }}
                          onMouseEnter={e => { if(!isToday && day > 0 && day <= 31) e.currentTarget.style.background = "var(--gray-50)"; }}
                          onMouseLeave={e => { if(!isToday) e.currentTarget.style.background = "transparent"; }}>
                          <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? "white" : day < 1 || day > 31 ? "var(--gray-200)" : isWeekend ? "var(--gray-400)" : "var(--gray-700)", marginBottom: 4, textAlign: "right" }}>
                            {day > 0 && day <= 31 ? day : ""}
                          </div>
                          {dayEvents.map((ev, ei) => (
                            <div key={ei} style={{ fontSize: 10.5, background: isToday ? "rgba(255,255,255,0.2)" : ev.color + "22", color: isToday ? "white" : ev.color, borderRadius: 3, padding: "1px 5px", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                              {ev.label}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar: events + scheduling */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gray-800)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="clock" size={14} color="var(--blue)" />Today — March 3
                    </div>
                    {[
                      { time: "9:00 AM", label: "Review Chen exhibits", type: "briefcase", color: "var(--gray-400)", matter: "Chen v. Realty" },
                      { time: "11:30 AM", label: "Team standup", type: "users", color: "var(--purple)", matter: "All matters" },
                      { time: "2:00 PM", label: `Video call — ${matters[0]?.client || "Client"}`, type: "video", color: "var(--blue)", matter: matters[0]?.title || "Matter", onClick: () => { setVideoCallContact({ name: selectedMatter?.client || "Client", matter: "Johnson Divorce Proceeding", myName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You" }); setShowVideoCall(true); } },
                      { time: "4:00 PM", label: "Draft motion in limine", type: "file", color: "var(--gray-400)", matter: "Chen v. Realty" },
                    ].map((ev, i) => (
                      <div key={i} onClick={ev.onClick} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: i < 3 ? "1px solid var(--gray-100)" : "none", alignItems: "center", cursor: ev.onClick ? "pointer" : "default", borderRadius: ev.onClick ? "var(--radius-sm)" : 0 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--gray-400)", width: 52, flexShrink: 0 }}>{ev.time}</div>
                        <div style={{ width: 3, height: 32, background: ev.color, borderRadius: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: ev.onClick ? "var(--blue)" : "var(--gray-800)" }}>{ev.label}</div>
                          <div style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{ev.matter}</div>
                        </div>
                        {ev.onClick && <Icon name="video" size={13} color="var(--blue)" style={{ marginLeft: "auto" }} />}
                      </div>
                    ))}
                  </div>

                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gray-800)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="clock" size={14} color="var(--amber)" />Upcoming Deadlines
                    </div>
                    {[
                      { date: "Mar 15", label: "Financial docs — Johnson", urgent: true },
                      { date: "Mar 20", label: "Trust signing — Martinez", urgent: false },
                      { date: "Mar 28", label: "Motion in limine — Chen", urgent: false },
                      { date: "Apr 3",  label: "Court date — Chen v. Realty", urgent: false },
                    ].map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 3 ? "1px solid var(--gray-100)" : "none" }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: d.urgent ? "var(--red)" : "var(--gray-500)", width: 48, flexShrink: 0 }}>{d.date}</div>
                        <div style={{ flex: 1, fontSize: 13.5, color: "var(--gray-700)" }}>{d.label}</div>
                        {d.urgent && <span className="badge badge-red" style={{ fontSize: 10 }}>Soon</span>}
                      </div>
                    ))}
                  </div>

                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gray-800)", marginBottom: 12 }}>Quick Schedule</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label>Client</label>
                        <select className="input select" style={{ fontSize: 13.5 }}>
                          {matters.map(m => <option key={m.id}>{m.client}</option>)}
                        </select>
                      </div>
                      <div>
                        <label>Date & Time</label>
                        <input className="input" type="datetime-local" defaultValue="2026-03-10T10:00" />
                      </div>
                      <div>
                        <label>Meeting type</label>
                        <select className="input select" style={{ fontSize: 13.5 }}>
                          <option>Video consultation</option>
                          <option>Phone call</option>
                          <option>In-person</option>
                        </select>
                      </div>
                      <button className="btn btn-primary" style={{ justifyContent: "center" }}><Icon name="calendar" size={14} />Schedule & Notify Client</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEAM PAGE */}
          {activePage === "team" && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Team</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>{currentFirm?.name || "Your Firm"} · 3 members · Pro Plan</p>
                </div>
                <button className="btn btn-primary"><Icon name="plus" size={15} />Invite Member</button>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Active Members", value: "3", icon: "users", color: "blue" },
                  { label: "Matters Handled", value: "5", icon: "briefcase", color: "teal" },
                  { label: "Avg Response Time", value: "2.4h", icon: "clock", color: "green" },
                  { label: "Tasks This Week", value: "14", icon: "check-circle", color: "purple" },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12.5, color: "var(--gray-500)" }}>{s.label}</span>
                      <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: s.color === "blue" ? "var(--blue-pale)" : s.color === "teal" ? "var(--teal-pale)" : s.color === "green" ? "var(--green-pale)" : "var(--purple-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={s.icon} size={14} color={"var(--" + s.color + ")"} />
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "var(--gray-900)" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Members */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  { name: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, role: "Attorney · Managing Partner", color: "blue", matters: 5, email: currentUser?.email || "attorney@yourfirm.com", bar: currentUser?.barNumber || "—", status: "online", tasks: 3, responseTime: "1.8h" },
                  { name: "Priya Patel", role: "Paralegal", color: "teal", matters: 5, email: "priya@riveralaw.com", bar: null, status: "online", tasks: 6, responseTime: "0.9h" },
                  { name: "Jordan Kim", role: "Legal Admin", color: "purple", matters: 0, email: "jordan@riveralaw.com", bar: null, status: "away", tasks: 5, responseTime: "3.2h" },
                ].map(member => (
                  <div key={member.name} className="card" style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ position: "relative" }}>
                      <Avatar name={member.name} size={52} color={member.color} />
                      <div style={{ position: "absolute", bottom: 2, right: 2, width: 11, height: 11, borderRadius: "50%", background: member.status === "online" ? "var(--green)" : "var(--amber)", border: "2px solid white" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>{member.name}</span>
                        <span className={"badge " + (member.status === "online" ? "badge-green" : "badge-amber")} style={{ fontSize: 10 }}>{member.status}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 2 }}>{member.role}</div>
                      <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{member.email}{member.bar ? " · " + member.bar : ""}</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 16, textAlign: "center" }}>
                      {[["Matters", member.matters], ["Tasks", member.tasks], ["Resp. time", member.responseTime]].map(([k,v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-800)" }}>{v}</div>
                          <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{k}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm"><Icon name="message" size={13} />Message</button>
                      <button className="btn btn-ghost btn-sm"><Icon name="settings" size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tasks board */}
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-800)" }}>Open Tasks</h2>
                <button className="btn btn-secondary btn-sm"><Icon name="plus" size={13} />New Task</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {[
                  { col: "To Do", color: "var(--gray-400)", items: [
                    { task: "Review motion in limine draft", matter: "Chen v. Realty", assignee: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, due: "Mar 28", priority: "high" },
                    { task: "Send retainer agreement to Park", matter: "Park Acquisition", assignee: "Priya Patel", due: "Mar 5", priority: "medium" },
                    { task: "Update FL-150 with new figures", matter: "Johnson Divorce", assignee: "Priya Patel", due: "Mar 12", priority: "high" },
                  ]},
                  { col: "In Progress", color: "var(--blue)", items: [
                    { task: "Prepare deposition exhibits", matter: "Chen v. Realty", assignee: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, due: "Mar 20", priority: "high" },
                    { task: "Follow up on bank statements", matter: "Johnson Divorce", assignee: "Priya Patel", due: "Mar 10", priority: "medium" },
                    { task: "Draft trust schedule A", matter: "Martinez Estate", assignee: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, due: "Mar 18", priority: "low" },
                  ]},
                  { col: "Done", color: "var(--green)", items: [
                    { task: "Open matter file", matter: "Park Acquisition", assignee: "Jordan Kim", due: "Mar 2", priority: "low" },
                    { task: "Send portal invite to Sarah Johnson", matter: "Johnson Divorce", assignee: "Jordan Kim", due: "Feb 27", priority: "medium" },
                    { task: "Conflict check — Park", matter: "Park Acquisition", assignee: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, due: "Mar 1", priority: "high" },
                  ]},
                ].map(col => (
                  <div key={col.col}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.col}</span>
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>{col.items.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {col.items.map((item, i) => (
                        <div key={i} className="card" style={{ padding: "12px 14px" }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)", marginBottom: 6, lineHeight: 1.4 }}>{item.task}</div>
                          <div style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 8 }}>{item.matter}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <Avatar name={item.assignee} size={20} color={item.assignee === `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}` ? "blue" : item.assignee === "Priya Patel" ? "teal" : "purple"} />
                              <span style={{ fontSize: 11.5, color: "var(--gray-500)" }}>{item.assignee.split(" ")[0]}</span>
                            </div>
                            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                              <span className={"badge " + (item.priority === "high" ? "badge-red" : item.priority === "medium" ? "badge-amber" : "badge-gray")} style={{ fontSize: 10 }}>{item.priority}</span>
                              <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{item.due}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activePage === "settings" && (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Settings</h1>
                <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>Manage your firm, account, and platform preferences</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, maxWidth: 960 }}>
                {/* Settings nav */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    ["Firm Profile", "briefcase", "profile"],
                    ["Security & Access", "shield", "security"],
                    ["Notifications", "bell", "notifications"],
                    ["Integrations", "link", "integrations"],
                    ["AI Configuration", "cpu", "ai"],
                    ["Billing & Plan", "dollar", "billing-plan"],
                    ["Audit Log", "activity", "audit"],
                  ].map(([label, icon, key]) => (
                    <div key={key} className="nav-item" style={{ background: "transparent", color: "var(--gray-600)", padding: "9px 12px" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--gray-100)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <Icon name={icon} size={15} color="var(--gray-400)" />
                      <span style={{ fontSize: 13.5, color: "var(--gray-700)" }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Settings content */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Firm Profile */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Firm Profile</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <div><label>Firm Name</label><input className="input" defaultValue={currentFirm?.name || "Your Firm"} /></div>
                      <div><label>Portal URL</label><input className="input" defaultValue={`${currentFirm?.slug || "yourfirm"}.counselbridge.io`} /></div>
                      <div><label>Practice Area(s)</label><input className="input" defaultValue={currentFirm?.practiceAreas || ""} /></div>
                      <div><label>Firm Phone</label><input className="input" defaultValue={currentFirm?.phone || ""} /></div>
                      <div><label>State Bar Number</label><input className="input" defaultValue={currentUser?.barNumber || ""} /></div>
                      <div><label>Jurisdiction</label><input className="input" defaultValue={currentFirm?.jurisdiction || ""} /></div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label>Firm Address</label>
                      <input className="input" defaultValue={currentFirm?.address || ""} />
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "14px 16px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1.5px dashed var(--gray-300)", marginBottom: 16, cursor: "pointer" }}>
                      <Icon name="upload" size={18} color="var(--gray-400)" />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-700)" }}>Upload firm logo</div>
                        <div style={{ fontSize: 12, color: "var(--gray-400)" }}>PNG or SVG · Shown on client portal and emails</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary btn-sm">Save Changes</button>
                      <button className="btn btn-secondary btn-sm">Preview Portal</button>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Security & Access</div>
                    {[
                      { label: "Multi-Factor Authentication", desc: "Required for all attorney accounts", enabled: true },
                      { label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", enabled: true },
                      { label: "Login Alerts", desc: "Email notification on new device login", enabled: true },
                      { label: "Client Magic Links", desc: "Allow clients to login without password", enabled: false },
                      { label: "IP Allowlisting", desc: "Restrict attorney access to approved IP ranges", enabled: false },
                    ].map(setting => (
                      <div key={setting.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)" }}>{setting.label}</div>
                          <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{setting.desc}</div>
                        </div>
                        <div style={{ width: 44, height: 24, borderRadius: 12, background: setting.enabled ? "var(--blue)" : "var(--gray-200)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: setting.enabled ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notifications */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Notification Preferences</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "10px 20px", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Event</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>In-App</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>SMS</div>
                      {[
                        ["New client message", true, true, false],
                        ["Document uploaded", true, true, false],
                        ["Invoice paid", true, true, false],
                        ["Deadline in 48 hours", true, true, true],
                        ["AI queue item", true, false, false],
                        ["Meeting reminder (1h)", true, true, true],
                        ["New intake form", true, true, false],
                      ].map(([label, inApp, email, sms]) => (
                        <>
                          <div key={label} style={{ fontSize: 13.5, color: "var(--gray-700)" }}>{label}</div>
                          {[inApp, email, sms].map((v, i) => (
                            <div key={i} style={{ width: 36, height: 20, borderRadius: 10, background: v ? "var(--blue)" : "var(--gray-200)", cursor: "pointer", position: "relative", margin: "0 auto" }}>
                              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: v ? 19 : 3, transition: "left 0.2s" }} />
                            </div>
                          ))}
                        </>
                      ))}
                    </div>
                  </div>

                  {/* Integrations */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Integrations</div>
                    {[
                      { name: "Google Calendar", desc: "Sync meetings and deadlines", icon: "calendar", connected: true },
                      { name: "Stripe", desc: "Payment processing", icon: "dollar", connected: true },
                      { name: "Microsoft Outlook", desc: "Calendar and email sync", icon: "mail", connected: false },
                      { name: "Dropbox Sign", desc: "E-signature workflows", icon: "file", connected: false },
                      { name: "Clio", desc: "Practice management sync", icon: "briefcase", connected: false },
                      { name: "Twilio SMS", desc: "Client text notifications", icon: "phone", connected: true },
                    ].map(intg => (
                      <div key={intg.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", background: intg.connected ? "var(--green-pale)" : "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name={intg.icon} size={16} color={intg.connected ? "var(--green)" : "var(--gray-400)"} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)" }}>{intg.name}</div>
                          <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{intg.desc}</div>
                        </div>
                        {intg.connected
                          ? <span className="badge badge-green" style={{ fontSize: 11 }}>Connected</span>
                          : <button className="btn btn-secondary btn-sm">Connect</button>
                        }
                      </div>
                    ))}
                  </div>

                  {/* AI Config */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 6 }}>AI Configuration</div>
                    <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 18 }}>Configure which AI agents are active and how they behave. All client-facing AI output requires attorney approval.</div>
                    {[
                      { name: "MessageDraftAgent", desc: "Draft reply suggestions when you open a message thread", enabled: true },
                      { name: "PlainLanguageAgent", desc: "Rewrite case updates in plain English for clients", enabled: true },
                      { name: "DigestAgent", desc: "Send daily matter briefing at 7:00 AM", enabled: true },
                      { name: "UrgencyClassifier", desc: "Score intake forms for urgency and practice area", enabled: true },
                      { name: "DocumentTagger", desc: "Auto-classify uploaded document types", enabled: true },
                      { name: "ClientChatAgent", desc: "Answer client process questions in the portal (never legal advice)", enabled: false },
                      { name: "MeetingSummaryAgent", desc: "Generate meeting summaries from transcripts (Phase 2)", enabled: false },
                    ].map(agent => (
                      <div key={agent.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-800)", display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="ai-badge" style={{ fontSize: 10 }}><Icon name="cpu" size={9} color="var(--purple)" />AI</span>
                            {agent.name}
                          </div>
                          <div style={{ fontSize: 12.5, color: "var(--gray-400)", marginTop: 2 }}>{agent.desc}</div>
                        </div>
                        <div style={{ width: 44, height: 24, borderRadius: 12, background: agent.enabled ? "var(--purple)" : "var(--gray-200)", cursor: "pointer", position: "relative", flexShrink: 0, marginLeft: 16, marginTop: 2 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: agent.enabled ? 23 : 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audit log */}
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>Recent Audit Log</div>
                    <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 16 }}>Immutable record of all platform actions · Retained 7 years</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {[
                        { time: "Today 10:32 AM", user: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, action: "Approved AI-generated case update", matter: "Johnson Divorce", type: "ai" },
                        { time: "Today 9:14 AM", user: selectedMatter?.client || "Client", action: "Uploaded 3 documents", matter: "Johnson Divorce", type: "document" },
                        { time: "Today 8:47 AM", user: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, action: "Sent message to client", matter: "Johnson Divorce", type: "message" },
                        { time: "Yesterday 5:01 PM", user: `${currentUser ? currentUser.firstName + " " + currentUser.lastName : "Attorney"}`, action: "Sent invoice INV-2024-009", matter: "Chen v. Realty", type: "billing" },
                        { time: "Yesterday 3:22 PM", user: "Amy Chen", action: "Logged in to client portal", matter: "Chen v. Realty", type: "auth" },
                        { time: "Yesterday 2:18 PM", user: "Priya Patel", action: "Added internal note", matter: "Johnson Divorce", type: "note" },
                      ].map((log, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: i < 5 ? "1px solid var(--gray-100)" : "none", alignItems: "flex-start" }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: log.type === "ai" ? "var(--purple-pale)" : log.type === "document" ? "var(--blue-pale)" : log.type === "billing" ? "var(--green-pale)" : log.type === "auth" ? "var(--teal-pale)" : "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                            <Icon name={log.type === "ai" ? "cpu" : log.type === "document" ? "file" : log.type === "billing" ? "dollar" : log.type === "auth" ? "lock" : "activity"} size={13} color={log.type === "ai" ? "var(--purple)" : log.type === "document" ? "var(--blue)" : log.type === "billing" ? "var(--green)" : log.type === "auth" ? "var(--teal)" : "var(--gray-400)"} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, color: "var(--gray-800)" }}><span style={{ fontWeight: 600 }}>{log.user}</span> — {log.action}</div>
                            <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{log.time} · {log.matter}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }}><Icon name="download" size={13} />Export Audit Log (CSV)</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
