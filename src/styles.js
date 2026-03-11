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

export default css;
