import { useState, useEffect, useRef } from "react";
import { Icon, StatusBadge, Avatar } from "../components/Icons";
import { DIGEST_TEXT } from "../lib/mockData";

export default function DashboardPage({
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
            <div className="scroll-y" style={{ flex: 1, padding: 24 }} >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--navy)", marginBottom: 2 }}>Good morning, {currentUser?.firstName || "there"}</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · {matters.filter(m => m.status?.toLowerCase() === "active").length} active matters</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewMatterModal(true)}><Icon name="plus" size={15} />New Matter</button>
              </div>

              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
                {[
                  { label: "Active Matters", value: matters.filter(m => m.status?.toLowerCase() === "active").length, icon: "briefcase", color: "blue", sub: "+2 this week" },
                  { label: "Unread Messages", value: matters.reduce((s,m) => s + (m.unread || 0), 0), icon: "message", color: "teal", sub: "Across 3 matters" },
                  { label: "Pending Invoices", value: "$" + invoices.filter(i => i.status?.toUpperCase() !== "PAID").reduce((s,i) => s + (i.amountCents ? i.amountCents/100 : (i.amount || 0)),0).toLocaleString(), icon: "dollar", color: "amber", sub: `${invoices.filter(i=>i.status?.toUpperCase()==="OVERDUE").length} overdue` },
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
                      <button className="btn btn-ghost btn-sm" onClick={() => setDigestExpanded(!digestExpanded)}>
                        <Icon name={digestExpanded ? "chevron_down" : "chevron_right"} size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                      {digestExpanded ? DIGEST_TEXT : DIGEST_TEXT.split("\n")[0]}
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
                      {aiQueue.slice(0, 3).map(item => (
                        <div key={item.id} style={{ padding: "10px 12px", background: "var(--purple-pale)", borderRadius: "var(--radius-sm)", marginBottom: 8, border: "1px solid #DDD6FE" }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--purple)", marginBottom: 4 }}>
                            {item.agentName || item.type} · {item.matter?.title || item.matterTitle || "—"}
                          </div>
                          <div style={{ fontSize: 12.5, color: "var(--gray-600)", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {item.output || item.preview}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-sm btn-danger" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} disabled={aiActionLoading === item.id} onClick={() => rejectAI(item.id)}>Reject</button>
                            <button className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={() => setActivePage("ai-queue")}><Icon name="eye" size={11} />Review</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upcoming */}
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 12 }}>Upcoming</div>
                    {[
                      { label: "Video Call — Sarah Johnson", date: "Today 2:00 PM", icon: "video", color: "blue", onClick: () => { setVideoCallContact({ name: "Sarah Johnson", matter: "Johnson Divorce Proceeding" }); setShowVideoCall(true); } },
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
  );
}
