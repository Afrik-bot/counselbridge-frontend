import { useState, useEffect, useRef } from "react";
import { Icon, StatusBadge, Avatar, Tooltip } from "./components/Icons";
import AIDraftModal from "./components/modals/AIDraftModal";
import VideoCall from "./components/modals/VideoCall";
import StripePaymentModal from "./components/modals/StripePaymentModal";
import MatterDetail from "./components/MatterDetail";
import DashboardPage from "./pages/DashboardPage";
import MattersListPage from "./pages/MattersListPage";
import AIQueuePage from "./pages/AIQueuePage";
import BillingPage from "./pages/BillingPage";
import DocumentsPage from "./pages/DocumentsPage";
import InboxPage from "./pages/InboxPage";
import CalendarPage from "./pages/CalendarPage";
import TeamPage from "./pages/TeamPage";
import SettingsPage from "./pages/SettingsPage";
import { DOC_REQUESTS, TIMELINE } from "./lib/mockData";

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

export default function CounselBridge() {
  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(localStorage.getItem("cb_user")); } catch { return null; } });
  const [currentFirm, setCurrentFirm] = useState(() => { try { return JSON.parse(localStorage.getItem("cb_firm")); } catch { return null; } });
  const [view, setView] = useState(() => {
    try {
      const token = localStorage.getItem("cb_token");
      const user = JSON.parse(localStorage.getItem("cb_user"));
      if (token && user) return user.role === "CLIENT" ? "client" : "attorney";
    } catch {}
    return "login";
  });
  const [loginType, setLoginType] = useState("attorney");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
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
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState({});
  const [notifications, setNotifications] = useState(3);
  const [searchQ, setSearchQ] = useState("");
  const [clientMatterId] = useState(1);
  const [clientTab, setClientTab] = useState("updates");
  const [payingInvoice, setPayingInvoice] = useState(null);
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
  const msgEndRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [billingFilter, setBillingFilter] = useState("All Invoices");
  const [nmForm, setNmForm] = useState({ clientFirstName: "", clientLastName: "", clientEmail: "", clientPhone: "", title: "", practiceArea: "Family Law", notes: "", billingType: "Hourly" });
  const [nmLoading, setNmLoading] = useState(false);
  const [nmError, setNmError] = useState("");

  // ─── SETTINGS STATE ────────────────────────────────────────────────────────
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const logoInputRef = useRef(null);
  const [firmForm, setFirmForm] = useState({
    name: "", phone: "", address: "", website: "", barNumber: "", jurisdiction: "", slug: "",
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", firstName: "", lastName: "", role: "ATTORNEY" });
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [firmStats, setFirmStats] = useState(null);
  const [agentToggles, setAgentToggles] = useState({
    MessageDraftAgent: true, PlainLanguageAgent: true, DigestAgent: true,
    UrgencyClassifier: true, DocumentTagger: true, ClientChatAgent: false, MeetingSummaryAgent: false,
  });
  const [notifPrefs, setNotifPrefs] = useState({
    newMessage: { inApp: true, email: true, sms: false },
    documentUploaded: { inApp: true, email: true, sms: false },
    invoicePaid: { inApp: true, email: true, sms: false },
    deadline48h: { inApp: true, email: true, sms: true },
    aiQueue: { inApp: true, email: false, sms: false },
    meetingReminder: { inApp: true, email: true, sms: true },
    newIntake: { inApp: true, email: true, sms: false },
  });


  // ─── API LAYER ─────────────────────────────────────────────────────────────
  const API_BASE = "https://api.counselbridge.me";
  const apiFetch = async (path, options = {}) => {
    const token = localStorage.getItem("cb_token");
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) };
    const res = await fetch(API_BASE + path, { ...options, headers });
    if (res.status === 401) { console.warn("401 on", path); return null; }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Error " + res.status);
    return data;
  };
  const API = {
    login: (email, password) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    matters: () => apiFetch("/api/matters"),
    getMatter: (id) => apiFetch("/api/matters/" + id),
    createMatter: (d) => apiFetch("/api/matters", { method: "POST", body: JSON.stringify(d) }),
    invoices: () => apiFetch("/api/invoices"),
    clientInvoices: () => apiFetch("/api/invoices/client"),
    aiQueue: () => apiFetch("/api/ai/queue"),
    // Firm settings
    getFirm: () => apiFetch("/api/firms/me"),
    updateFirm: (d) => apiFetch("/api/firms/me", { method: "PUT", body: JSON.stringify(d) }),
    getLogoUrl: () => apiFetch("/api/firms/me/logo-url"),
    getTeam: () => apiFetch("/api/firms/me/team"),
    inviteMember: (d) => apiFetch("/api/firms/me/team/invite", { method: "POST", body: JSON.stringify(d) }),
    updateMemberRole: (id, role) => apiFetch(`/api/firms/me/team/${id}`, { method: "PATCH", body: JSON.stringify({ role }) }),
    removeMember: (id) => apiFetch(`/api/firms/me/team/${id}`, { method: "DELETE" }),
    getAuditLog: (p) => apiFetch(`/api/firms/me/audit-log?page=${p||1}&limit=50`),
    getFirmStats: () => apiFetch("/api/firms/me/stats"),
  };

  // ─── SETTINGS HELPERS ─────────────────────────────────────────────────────
  const loadFirmSettings = async () => {
    try {
      const [firmData, logoData, statsData] = await Promise.all([
        API.getFirm(), API.getLogoUrl(), API.getFirmStats(),
      ]);
      if (firmData?.firm) {
        const f = firmData.firm;
        setFirmForm({ name: f.name||"", phone: f.phone||"", address: f.address||"", website: f.website||"", barNumber: f.barNumber||"", jurisdiction: f.jurisdiction||"", slug: f.slug||"" });
        if (f.settings?.agentToggles) setAgentToggles(prev => ({ ...prev, ...f.settings.agentToggles }));
        if (f.settings?.notifPrefs) setNotifPrefs(prev => ({ ...prev, ...f.settings.notifPrefs }));
        setCurrentFirm(f);
        localStorage.setItem("cb_firm", JSON.stringify(f));
      }
      if (logoData?.logoUrl) setLogoUrl(logoData.logoUrl);
      if (statsData) setFirmStats(statsData);
    } catch(e) { console.error("loadFirmSettings", e); }
  };

  const saveFirmProfile = async () => {
    setSettingsSaving(true); setSettingsError(""); setSettingsSaved(false);
    try {
      const data = await API.updateFirm(firmForm);
      if (data?.firm) {
        setCurrentFirm(data.firm);
        localStorage.setItem("cb_firm", JSON.stringify(data.firm));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch(e) { setSettingsError(e.message || "Failed to save"); }
    setSettingsSaving(false);
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    setLogoUploading(true);
    try {
      const token = localStorage.getItem("cb_token");
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch(API_BASE + "/api/firms/me/logo", {
        method: "POST", headers: { Authorization: "Bearer " + token }, body: formData,
      });
      const data = await res.json();
      if (res.ok && data.logoUrl) setLogoUrl(data.logoUrl);
      else setSettingsError(data.error || "Logo upload failed");
    } catch(e) { setSettingsError("Logo upload failed"); }
    setLogoUploading(false);
  };

  const loadTeam = async () => {
    setTeamLoading(true);
    try {
      const data = await API.getTeam();
      if (data?.users) setTeamMembers(data.users);
    } catch(e) { console.error("loadTeam", e); }
    setTeamLoading(false);
  };

  const inviteMember = async () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) return;
    setInviting(true); setInviteMsg("");
    try {
      const data = await API.inviteMember(inviteForm);
      if (data?.user) {
        setTeamMembers(prev => [...prev, data.user]);
        setInviteForm({ email: "", firstName: "", lastName: "", role: "ATTORNEY" });
        setInviteMsg(`✓ Invitation sent to ${inviteForm.email}`);
        setTimeout(() => setInviteMsg(""), 4000);
      }
    } catch(e) { setInviteMsg("✗ " + (e.message || "Failed to invite")); }
    setInviting(false);
  };

  const loadAuditLog = async () => {
    setAuditLoading(true);
    try {
      const data = await API.getAuditLog(1);
      if (data?.logs) setAuditLogs(data.logs);
    } catch(e) { console.error("loadAuditLog", e); }
    setAuditLoading(false);
  };

  const saveAgentSettings = async () => {
    setSettingsSaving(true);
    try {
      const firm = await API.getFirm();
      const currentSettings = firm?.firm?.settings || {};
      await API.updateFirm({ settings: { ...currentSettings, agentToggles, notifPrefs } });
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000);
    } catch(e) { setSettingsError(e.message); }
    setSettingsSaving(false);
  };

  // Load data after login
  useEffect(() => {
    if (view === "attorney") {
      API.matters().then(data => { if (data) setMatters(Array.isArray(data) ? data : (data.matters || [])); });
      API.invoices().then(data => { if (data) setInvoices(Array.isArray(data) ? data : (data.invoices || [])); });
      API.aiQueue().then(data => { if (data) setAiQueue(Array.isArray(data) ? data : (data.queue || [])); });
    } else if (view === "client") {
      API.matters().then(data => { if (data) setMatters(Array.isArray(data) ? data : (data.matters || [])); });
      API.clientInvoices().then(data => { if (data) setInvoices(Array.isArray(data) ? data : (data.invoices || [])); });
    }
  }, [view]);

  // Load settings data when settings page opens
  useEffect(() => {
    const token = localStorage.getItem("cb_token");
    if (activePage === "settings" && view === "attorney" && token) {
      loadFirmSettings();
      loadTeam();
    }
  }, [activePage, view]);

  // Load audit log when audit tab opens
  useEffect(() => {
    const token = localStorage.getItem("cb_token");
    if (activePage === "settings" && activeSettingsTab === "audit" && view === "attorney" && token) {
      loadAuditLog();
    }
  }, [activeSettingsTab]);

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

  const generateAIDraft = () => {
    if (!selectedMatter) return;
    setAiTyping(true);
    setAiDraft("");
    const drafts = {
      1: "Hi Sarah, thank you for uploading those documents — I can confirm we received the bank statements and both tax returns. I'm still waiting on the mortgage statement, your retirement account statements, and any business ownership documents. Could you upload those as soon as possible? We have until March 20 to file.",
      3: "Hi Amy, I wanted to follow up on the discovery letter from opposing counsel. I've reviewed it thoroughly and will be filing our response by end of this week. Your court date on April 3rd remains confirmed. Please let me know if you have any questions.",
    };
    setTimeout(() => {
      setAiTyping(false);
      setAiDraft(drafts[selectedMatter.id] || "I've reviewed your recent message and wanted to provide an update on your matter. Please feel free to reach out if you have any questions.");
    }, 1800);
  };

  const sendMessage = () => {
    if (!newMsg.trim() && !aiDraft.trim()) return;
    const body = aiDraft || newMsg;
    const newMessages = { ...messages };
    if (!newMessages[selectedMatter.id]) newMessages[selectedMatter.id] = [];
    newMessages[selectedMatter.id] = [...newMessages[selectedMatter.id], {
      id: Date.now(), sender: "attorney", name: "Alex Rivera", body, time: "Just now", read: true, internal: showInternal, aiGenerated: !!aiDraft
    }];
    setMessages(newMessages);
    setNewMsg("");
    setAiDraft("");
  };

  const sendClientChat = async () => {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg;
    setChatMsg("");
    setChatHistory(h => [...h, { role: "user", text: userMsg }]);
    setAiChatLoading(true);
    try {
      const token = localStorage.getItem("cb_token");
      const matter = matters.find(m => m.id === clientMatterId);
      const resp = await fetch(API_BASE + "/api/ai/client-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          message: userMsg,
          matterId: clientMatterId,
          matterTitle: matter?.title || "your case",
          matterStatus: matter?.status || "Active",
          nextStep: matter?.nextStep || "Your attorney will be in touch.",
        })
      });
      const data = await resp.json();
      const text = data.reply || data.text || "I'm sorry, I couldn't process that. Please message your attorney directly.";
      setChatHistory(h => [...h, { role: "ai", text }]);
    } catch {
      setChatHistory(h => [...h, { role: "ai", text: "I'm having trouble connecting right now. Please message your attorney directly for assistance." }]);
    }
    setAiChatLoading(false);
  };

  const [aiActionLoading, setAiActionLoading] = useState(null);

  const approveAI = async (id, editedText) => {
    setAiActionLoading(id);
    try {
      const token = localStorage.getItem("cb_token");
      const res = await fetch(`${API_BASE}/api/ai/approve/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ editedOutput: editedText }),
      });
      if (res.ok) {
        setAiQueue(q => q.filter(i => i.id !== id));
        setShowAIModal(null);
      }
    } catch(e) { console.error("approveAI failed", e); }
    setAiActionLoading(null);
  };

  const rejectAI = async (id) => {
    setAiActionLoading(id);
    try {
      const token = localStorage.getItem("cb_token");
      const res = await fetch(`${API_BASE}/api/ai/reject/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      });
      if (res.ok) {
        setAiQueue(q => q.filter(i => i.id !== id));
        setShowAIModal(null);
      }
    } catch(e) { console.error("rejectAI failed", e); }
    setAiActionLoading(null);
  };

  const filteredMatters = matters.filter(m =>
    !searchQ || m.title.toLowerCase().includes(searchQ.toLowerCase()) || m.client.toLowerCase().includes(searchQ.toLowerCase()) || m.practice.toLowerCase().includes(searchQ.toLowerCase())
  );


  // ─── PAGE PROPS ───────────────────────────────────────────────────────────
  const pageProps = {
    currentUser, currentFirm, setCurrentFirm,
    matters, setMatters, invoices, setInvoices,
    documents, setDocuments, aiQueue, setAiQueue,
    setSelectedMatter, setActivePage, setShowNewMatterModal,
    setShowInvoiceModal, setShowVideoCall, setVideoCallContact,
    searchQ, setSearchQ, billingFilter, setBillingFilter,
    aiActionLoading, approveAI, rejectAI, showAIModal, setShowAIModal,
    activeSettingsTab, setActiveSettingsTab,
    settingsSaving, setSettingsSaving, settingsSaved, setSettingsSaved,
    settingsError, setSettingsError, logoUploading, setLogoUploading,
    logoUrl, setLogoUrl, logoInputRef, firmForm, setFirmForm,
    teamMembers, setTeamMembers, teamLoading, inviteForm, setInviteForm,
    inviting, setInviting, inviteMsg, setInviteMsg,
    auditLogs, auditLoading, firmStats,
    agentToggles, setAgentToggles, notifPrefs, setNotifPrefs,
    loadFirmSettings, saveFirmProfile, uploadLogo,
    loadTeam, inviteMember, loadAuditLog, saveAgentSettings,
    nmForm, setNmForm, nmLoading, setNmLoading, nmError, setNmError,
    digestExpanded, setDigestExpanded,
    filteredMatters, matterTab, setMatterTab,
    messages, setMessages,
    API_BASE,
  };

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (view === "login") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F2240 0%, #1B3A5C 50%, #0F2240 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{css}</style>
      {/* Background decoration */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 80%, rgba(37,99,235,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13,148,136,0.1) 0%, transparent 50%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

      <div className="fade-in" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 42, height: 42, background: "var(--blue)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="shield" size={22} color="white" />
            </div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "white", letterSpacing: "-0.5px" }}>CounselBridge</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5 }}>Secure Legal Communication Platform</p>
        </div>

        {/* Toggle */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-md)", padding: 4, display: "flex", marginBottom: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
          {["attorney", "client"].map(t => (
            <button key={t} onClick={() => setLoginType(t)} style={{ flex: 1, padding: "9px 0", borderRadius: "var(--radius-sm)", background: loginType === t ? "var(--white)" : "transparent", color: loginType === t ? "var(--navy)" : "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", border: "none", transition: "all var(--transition)", fontFamily: "var(--font-sans)" }}>
              {t === "attorney" ? "⚖️  Attorney / Staff" : "👤  Client"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: "var(--radius-xl)", padding: "32px 28px", boxShadow: "var(--shadow-xl)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 6 }}>
            {loginType === "attorney" ? "Welcome back" : "Your secure portal"}
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--gray-500)", marginBottom: 24 }}>
            {loginType === "attorney" ? "Sign in to your firm workspace" : "Access your case information securely"}
          </p>
          <div style={{ marginBottom: 14 }}>
            <label>Email address</label>
            <input className="input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              <span style={{ fontSize: 12.5, color: "var(--blue)", cursor: "pointer" }}>Forgot password?</span>
            </div>
            <input className="input" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px 0", fontSize: 15, borderRadius: "var(--radius-md)" }} onClick={async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("cb_token", data.accessToken);
      localStorage.setItem("cb_refresh", data.refreshToken);
      localStorage.setItem("cb_user", JSON.stringify(data.user));
      localStorage.setItem("cb_firm", JSON.stringify(data.firm));
      setCurrentUser(data.user);
      setCurrentFirm(data.firm);
      const role = data.user.role;
      setView(role === "CLIENT" ? "client" : "attorney");
      setActivePage("dashboard");
    } catch(e) {
      setLoginError(e.message || "Invalid email or password");
    }
    setLoginLoading(false);
  }} disabled={loginLoading}>
            {loginLoading ? "Signing in..." : "Sign In Securely"} <Icon name="arrow_right" size={16} />
          </button>
          {loginError && <div style={{ color: "var(--red)", fontSize: 13, textAlign: "center", marginTop: 8 }}>{loginError}</div>}
          {loginType === "client" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
                <span style={{ fontSize: 12, color: "var(--gray-400)" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
              </div>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", borderRadius: "var(--radius-md)" }}>
                <Icon name="mail" size={15} /> Send me a magic link
              </button>
            </>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          Protected by 256-bit encryption · SOC 2 compliant
        </p>
      </div>

      {/* Demo switcher */}
      <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", gap: 8 }}>
        <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }} onClick={() => { setLoginType("attorney"); setView("attorney"); setActivePage("dashboard"); }}>
          Attorney Demo →
        </button>
        <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }} onClick={() => { setLoginType("client"); setView("client"); }}>
          Client Demo →
        </button>
      </div>
    </div>
  );

  // ─── CLIENT PORTAL ─────────────────────────────────────────────────────────
  if (view === "client") {
    const matter = matters.find(m => m.id === clientMatterId);
    const docReqs = DOC_REQUESTS[clientMatterId] || [];
    const timeline = TIMELINE[clientMatterId] || [];
    const clientMsgs = (messages[clientMatterId] || []).filter(m => !m.internal);
    const totalReqs = docReqs.length;
    const doneReqs = docReqs.filter(d => d.done).length;

    return (
      <div style={{ minHeight: "100vh", background: "var(--gray-50)", fontFamily: "var(--font-sans)" }}>
        <style>{css}</style>
        {/* VIDEO CALL */}
        {showVideoCall && (
          <VideoCall
            contact={videoCallContact}
            onClose={() => { setShowVideoCall(false); setVideoCallContact(null); }}
            isClient={true}
            currentUser={currentUser}
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
            <span style={{ fontSize: 13.5, color: "var(--gray-600)" }}>Sarah Johnson</span>
            <Avatar name="Sarah Johnson" size={32} color="teal" />
            <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem("cb_token"); localStorage.removeItem("cb_refresh"); localStorage.removeItem("cb_user"); localStorage.removeItem("cb_firm"); setCurrentUser(null); setCurrentFirm(null); setMatters([]); setMessages({}); setInvoices([]); setAiQueue([]); setView("login"); }}><Icon name="log-out" size={15} /></button>
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
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{matter.referenceCode || matter.ref || ""}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>·</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{matter.practiceArea || matter.practice || ""}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", padding: "14px 16px", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>What happens next</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{matter.nextStepClient || matter.nextStep || "Your attorney will be in touch with next steps."}</p>
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
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 2 }}>Video consultation with Alex Rivera</div>
                    <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Today · 2:00 PM · ~30 minutes</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => { setVideoCallContact({ name: "Alex Rivera", matter: matter.title }); setShowVideoCall(true); }}>
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
                  <Avatar name="Alex Rivera" size={28} color="blue" />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-800)" }}>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Attorney"}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{currentFirm?.name || "Your Firm"} · Your Attorney</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setVideoCallContact({ name: "Alex Rivera", matter: matter.title }); setShowVideoCall(true); }}><Icon name="video" size={13} />Video Call</button>
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
                  <input className="input" style={{ flex: 1 }} placeholder="Message your attorney..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&newMsg.trim()){ const updated={...messages}; if(!updated[1])updated[1]=[]; updated[1]=[...updated[1],{id:Date.now(),sender:"client",name:"Sarah Johnson",body:newMsg,time:"Just now",read:false,internal:false}]; setMessages(updated); setNewMsg(""); } }} />
                  <button className="btn btn-primary btn-sm" onClick={() => { if(!newMsg.trim())return; const updated={...messages}; if(!updated[1])updated[1]=[]; updated[1]=[...updated[1],{id:Date.now(),sender:"client",name:"Sarah Johnson",body:newMsg,time:"Just now",read:false,internal:false}]; setMessages(updated); setNewMsg(""); }}><Icon name="send" size={14} /></button>
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
                {(documents[matter?.id] || []).filter(d => d.shared).map(doc => (
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
              {invoices.filter(i => i.matterId === clientMatterId).map(inv => (
                <div key={inv.id} className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: inv.status?.toUpperCase() !== "PAID" ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 4 }}>{inv.desc}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{inv.number}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>Issued {inv.date}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 12.5, color: inv.status?.toUpperCase() === "OVERDUE" ? "var(--red)" : "var(--gray-400)", fontWeight: inv.status?.toUpperCase() === "OVERDUE" ? 700 : 400 }}>Due {inv.due}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>${(inv.amountCents ? inv.amountCents/100 : (inv.amount || 0)).toLocaleString()}</div>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                  {inv.status?.toUpperCase() !== "PAID" && (
                    <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 14 }}>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 10 }}>Pay securely via credit card, debit card, or bank transfer</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setPayingInvoice(inv)}><Icon name="lock" size={14} />Pay ${(inv.amountCents ? inv.amountCents/100 : (inv.amount || 0)).toLocaleString()} Now</button>
                        <button className="btn btn-secondary btn-sm"><Icon name="download" size={13} />Download</button>
                      </div>
                    </div>
                  )}
                  {inv.status?.toUpperCase() === "PAID" && (
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

        {/* Stripe Payment Modal */}
        {payingInvoice && (
          <StripePaymentModal
            invoice={payingInvoice}
            onClose={() => setPayingInvoice(null)}
            onPaid={(id) => {
              setPayingInvoice(null);
            }}
          />
        )}

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
  const NavItem = ({ icon, label, page, badge }) => (
    <div className={`nav-item ${activePage === page ? "active" : ""}`} onClick={() => { setActivePage(page); setSelectedMatter(null); }}>
      <Icon name={icon} size={16} color={activePage === page ? "white" : "rgba(255,255,255,0.6)"} />
      <span>{label}</span>
      {badge > 0 && <span className="badge-count">{badge}</span>}
    </div>
  );

  // ─── MATTER DETAIL ─────────────────────────────────────────────────────────
  // MatterDetail is defined as a top-level component above CounselBridge


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
          currentUser={currentUser}
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
      {showNewMatterModal && (() => {
        const handleCreate = async () => {
          if (!nmForm.clientEmail || !nmForm.title || !nmForm.clientFirstName || !nmForm.clientLastName) {
            setNmError("Client name, email, and matter title are required."); return;
          }
          setNmLoading(true); setNmError("");
          try {
            const token = localStorage.getItem("cb_token");
            const res = await fetch("https://api.counselbridge.me/api/matters", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
              body: JSON.stringify({
                title: nmForm.title,
                practiceArea: nmForm.practiceArea,
                notes: nmForm.notes,
                clientFirstName: nmForm.clientFirstName,
                clientLastName: nmForm.clientLastName,
                clientEmail: nmForm.clientEmail,
                clientPhone: nmForm.clientPhone,
              }),
            });
            const data = await res.json();
            if (!res.ok) { setNmError(data.error || "Failed to create matter"); setNmLoading(false); return; }
            // Refresh matters list
            API.matters().then(d => { if (d) setMatters(Array.isArray(d) ? d : (d.matters || [])); });
            setShowNewMatterModal(false);
            if (data.matter) { setSelectedMatter(data.matter); setActivePage("matter"); }
          } catch(e) { setNmError(e.message || "Network error"); }
          setNmLoading(false);
        };

        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,34,64,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={() => setShowNewMatterModal(false)}>
            <div className="card fade-in" style={{ width: 560, maxHeight: "85vh", overflow: "auto", padding: 32 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "var(--navy)", fontFamily: "var(--font-serif)" }}>Open New Matter</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowNewMatterModal(false); setNmError(""); }}><Icon name="x" size={16} /></button>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--gray-500)", marginBottom: 24 }}>Fill in the details below. A client portal invitation will be sent automatically.</p>

              {nmError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#dc2626" }}>
                  {nmError}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label>Client First Name *</label><input className="input" value={nmForm.clientFirstName} onChange={e => setNmForm(p => ({...p, clientFirstName: e.target.value}))} placeholder="Sarah" /></div>
                  <div><label>Client Last Name *</label><input className="input" value={nmForm.clientLastName} onChange={e => setNmForm(p => ({...p, clientLastName: e.target.value}))} placeholder="Johnson" /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label>Client Email *</label><input className="input" type="email" value={nmForm.clientEmail} onChange={e => setNmForm(p => ({...p, clientEmail: e.target.value}))} placeholder="client@email.com" /></div>
                  <div><label>Client Phone</label><input className="input" value={nmForm.clientPhone} onChange={e => setNmForm(p => ({...p, clientPhone: e.target.value}))} placeholder="(415) 555-0100" /></div>
                </div>
                <div><label>Matter Title *</label><input className="input" value={nmForm.title} onChange={e => setNmForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Johnson Divorce Proceeding" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label>Practice Area</label>
                    <select className="input select" value={nmForm.practiceArea} onChange={e => setNmForm(p => ({...p, practiceArea: e.target.value}))}>
                      <option>Family Law</option><option>Estate Planning</option><option>Litigation</option>
                      <option>Corporate</option><option>Personal Injury</option><option>Real Estate</option><option>Criminal Defense</option>
                    </select>
                  </div>
                  <div><label>Billing Type</label>
                    <select className="input select" value={nmForm.billingType} onChange={e => setNmForm(p => ({...p, billingType: e.target.value}))}>
                      <option>Hourly</option><option>Flat fee</option><option>Contingency</option>
                    </select>
                  </div>
                </div>
                <div><label>Initial Notes (internal)</label><textarea className="input textarea" value={nmForm.notes} onChange={e => setNmForm(p => ({...p, notes: e.target.value}))} placeholder="Brief description of the matter and client situation..." /></div>
                <div style={{ background: "var(--blue-pale)", border: "1px solid var(--blue-pale2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--blue)" }}>
                  <Icon name="mail" size={13} color="var(--blue)" /> A portal invitation email will be sent to the client automatically.
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
                  <button className="btn btn-secondary" onClick={() => setShowNewMatterModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleCreate} disabled={nmLoading}>
                    <Icon name="briefcase" size={14} />{nmLoading ? "Creating…" : "Open Matter & Invite Client"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,34,64,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={() => setShowInvoiceModal(false)}>
          <div className="card fade-in" style={{ width: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>Create Invoice</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInvoiceModal(false)}><Icon name="x" size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label>Matter</label><select className="input select"><option>Johnson Divorce Proceeding</option></select></div>
              <div><label>Description</label><input className="input" defaultValue="Legal services — March 2024" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label>Amount</label><input className="input" defaultValue="1,800.00" /></div>
                <div><label>Due Date</label><input className="input" type="date" defaultValue="2024-04-01" /></div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <button className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                <button className="btn btn-secondary">Save Draft</button>
                <button className="btn btn-primary" onClick={() => setShowInvoiceModal(false)}><Icon name="send" size={14} />Send to Client</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <NavItem icon="home" label="Dashboard" page="dashboard" />
          <NavItem icon="briefcase" label="Matters" page="matters" badge={matters.filter(m => m.unread > 0).length} />
          <NavItem icon="inbox" label="Inbox" page="inbox" badge={5} />
          <NavItem icon="calendar" label="Calendar" page="calendar" />
          <NavItem icon="cpu" label="AI Queue" page="ai-queue" badge={aiQueue.length} />
          <NavItem icon="file" label="Documents" page="documents" />
          <NavItem icon="dollar" label="Billing" page="billing" />
          <NavItem icon="users" label="Team" page="team" />
          <div style={{ flex: 1 }} />
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 2px" }} />
          <NavItem icon="settings" label="Settings" page="settings" />
          <div className="nav-item" onClick={() => { localStorage.removeItem("cb_token"); localStorage.removeItem("cb_refresh"); localStorage.removeItem("cb_user"); localStorage.removeItem("cb_firm"); setCurrentUser(null); setCurrentFirm(null); setMatters([]); setMessages({}); setInvoices([]); setAiQueue([]); setView("login"); }} style={{ color: "rgba(255,255,255,0.5)" }}>
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
            <Avatar name={currentUser ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() : "A"} size={30} color="blue" />
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
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* MATTER DETAIL */}

          {selectedMatter && activePage === "matters" && (
            <MatterDetail
              matter={selectedMatter}
              messages={messages}
              documents={documents}
              invoices={invoices}
              showInternal={showInternal}
              setShowInternal={setShowInternal}
              aiTyping={aiTyping}
              aiDraft={aiDraft}
              setAiDraft={setAiDraft}
              newMsg={newMsg}
              setNewMsg={setNewMsg}
              msgEndRef={msgEndRef}
              sendMessage={sendMessage}
              generateAIDraft={generateAIDraft}
              matterTab={matterTab}
              setMatterTab={setMatterTab}
              setShowVideoCall={setShowVideoCall}
              setVideoCallContact={setVideoCallContact}
              setShowInvoiceModal={setShowInvoiceModal}
              currentUser={currentUser}
              DOC_REQUESTS={DOC_REQUESTS}
              TIMELINE={TIMELINE}
              uploadInputRef={uploadInputRef}
              uploading={uploading}
              setUploading={setUploading}
              setDocuments={setDocuments}
            />
          )}

          {/* DASHBOARD */}

            {activePage === "dashboard" && <DashboardPage {...pageProps} />}
            {activePage === "matters" && !selectedMatter && <MattersListPage {...pageProps} />}
            {activePage === "ai-queue" && <AIQueuePage {...pageProps} />}
            {activePage === "billing" && <BillingPage {...pageProps} />}
            {activePage === "documents" && <DocumentsPage {...pageProps} />}
            {activePage === "inbox" && <InboxPage {...pageProps} />}
            {activePage === "calendar" && <CalendarPage {...pageProps} />}
            {activePage === "team" && <TeamPage {...pageProps} />}
            {activePage === "settings" && <SettingsPage {...pageProps} />}

        </div>
      </div>
    </div>
  );
}
