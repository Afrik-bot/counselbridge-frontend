import { useState, useEffect, useRef } from "react";
import { Icon, StatusBadge, Avatar } from "../components/Icons";

export default function InboxPage({
  currentUser, currentFirm, setCurrentFirm,
  matters, setMatters, invoices, setInvoices,
  documents, setDocuments, aiQueue, setAiQueue,
  setSelectedMatter, setActivePage, setShowNewMatterModal,
  setShowInvoiceModal, setShowVideoCall, setVideoCallContact,
  searchQ, billingFilter, setBillingFilter,
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
}) {
  return (
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
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>{msg.matter?.practiceArea || msg.matter?.practice || ""}</span>
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

              {/* Earlier section */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Earlier today</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { name: "Carlos Martinez", matter: "Martinez Estate Planning", body: "I've reviewed the trust document — looks great. When do we sign?", time: "8:02 AM", practice: "Estate Planning" },
                  { name: "Priya Patel", matter: "Chen v. Realty Group", body: "Internal: Filed the exhibit list. Motion in limine draft ready for your review.", time: "7:48 AM", practice: "Litigation", internal: true },
                  { name: "Ji-soo Park", matter: "Park Business Acquisition", body: "Hi, I submitted a new inquiry — wanted to follow up on timing for the initial consultation.", time: "7:15 AM", practice: "Corporate" },
                ].map((msg, i) => (
                  <div key={i} className="card card-hover" style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", borderLeft: msg.internal ? "3px solid var(--amber)" : "3px solid var(--gray-200)" }}
                    onClick={() => { const m = matters.find(x => x.title === msg.matter); if(m){ setSelectedMatter(m); setActivePage("matters"); setMatterTab("messages"); } }}>
                    <Avatar name={msg.name} size={40} color={msg.internal ? "amber" : "blue"} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-800)" }}>{msg.name}</span>
                        <span style={{ color: "var(--gray-300)" }}>·</span>
                        <span style={{ fontSize: 13, color: "var(--gray-500)" }}>{msg.matter}</span>
                        {msg.internal && <span className="badge badge-amber" style={{ fontSize: 10 }}>Internal</span>}
                      </div>
                      <div style={{ fontSize: 13.5, color: "var(--gray-500)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{msg.body}</div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--gray-400)", whiteSpace: "nowrap" }}>{msg.time}</span>
                  </div>
                ))}
              </div>
            </div>
  );
}
