import { useState, useEffect, useRef } from "react";
import { Icon, Avatar } from "../components/Icons";

export default function TeamPage({
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
                  { name: "Alex Rivera", role: "Attorney · Managing Partner", color: "blue", matters: 5, email: "alex@riveralaw.com", bar: "CA Bar #294812", status: "online", tasks: 3, responseTime: "1.8h" },
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
                    { task: "Review motion in limine draft", matter: "Chen v. Realty", assignee: "Alex Rivera", due: "Mar 28", priority: "high" },
                    { task: "Send retainer agreement to Park", matter: "Park Acquisition", assignee: "Priya Patel", due: "Mar 5", priority: "medium" },
                    { task: "Update FL-150 with new figures", matter: "Johnson Divorce", assignee: "Priya Patel", due: "Mar 12", priority: "high" },
                  ]},
                  { col: "In Progress", color: "var(--blue)", items: [
                    { task: "Prepare deposition exhibits", matter: "Chen v. Realty", assignee: "Alex Rivera", due: "Mar 20", priority: "high" },
                    { task: "Follow up on bank statements", matter: "Johnson Divorce", assignee: "Priya Patel", due: "Mar 10", priority: "medium" },
                    { task: "Draft trust schedule A", matter: "Martinez Estate", assignee: "Alex Rivera", due: "Mar 18", priority: "low" },
                  ]},
                  { col: "Done", color: "var(--green)", items: [
                    { task: "Open matter file", matter: "Park Acquisition", assignee: "Jordan Kim", due: "Mar 2", priority: "low" },
                    { task: "Send portal invite to Sarah Johnson", matter: "Johnson Divorce", assignee: "Jordan Kim", due: "Feb 27", priority: "medium" },
                    { task: "Conflict check — Park", matter: "Park Acquisition", assignee: "Alex Rivera", due: "Mar 1", priority: "high" },
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
                              <Avatar name={item.assignee} size={20} color={item.assignee === "Alex Rivera" ? "blue" : item.assignee === "Priya Patel" ? "teal" : "purple"} />
                              <span style={{ fontSize: 11.5, color: "var(--gray-500)" }}>{(item.assignee || "").split(" ")[0]}</span>
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
  );
}
