import { useState, useEffect, useRef } from "react";
import { Icon, StatusBadge } from "../components/Icons";

export default function MattersListPage({
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
  API_BASE,
}) {
  return (
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
  );
}
