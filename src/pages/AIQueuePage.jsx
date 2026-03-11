import { useState, useEffect, useRef } from "react";
import { Icon } from "../components/Icons";


export default function AIQueuePage({
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 4 }}>AI Approval Queue</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>Review and approve AI-generated content before it reaches clients. Nothing sends without your approval.</p>
                </div>
                {aiQueue.length > 0 && (
                  <span style={{ background: "var(--purple-pale)", color: "var(--purple)", fontWeight: 700, fontSize: 13, padding: "4px 12px", borderRadius: 20 }}>
                    {aiQueue.length} pending
                  </span>
                )}
              </div>

              {/* Legal disclaimer banner */}
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#92400e", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Icon name="shield" size={14} color="#d97706" />
                <span><strong>Attorney Responsibility:</strong> All AI-generated content requires your explicit review before delivery. You are responsible for all communications sent from this platform. Edit freely — the AI draft is a starting point only.</span>
              </div>

              {aiQueue.length === 0 ? (
                <div className="empty-state">
                  <Icon name="check-circle" size={48} color="var(--green)" />
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-600)", marginTop: 12 }}>Queue is clear</div>
                  <div style={{ fontSize: 14, color: "var(--gray-400)", marginTop: 4 }}>No AI-generated content awaiting approval</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
                  {aiQueue.map(item => {
                    const isEditing = showAIModal?.id === item.id;
                    const agentLabel = { MessageDraftAgent: "Message Draft", PlainLanguageAgent: "Case Update (Plain English)", MeetingSummaryAgent: "Meeting Summary" }[item.agentName] || item.agentName;
                    const matterTitle = item.matter?.title || item.matterTitle || "—";
                    const matterRef = item.matter?.referenceCode || "";
                    const generatedAt = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";
                    return (
                      <div key={item.id} className="card" style={{ padding: "20px 22px", border: isEditing ? "2px solid var(--blue)" : undefined }}>
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ width: 36, height: 36, background: "var(--purple-pale)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icon name="cpu" size={17} color="var(--purple)" />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-800)" }}>{agentLabel}</div>
                              <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>
                                {matterTitle}{matterRef ? ` · ${matterRef}` : ""} · {generatedAt}
                              </div>
                            </div>
                          </div>
                          <span className="ai-badge" style={{ background: "var(--amber-pale)", color: "#92400e", border: "1px solid #fde68a" }}>Pending Review</span>
                        </div>

                        {/* Draft content — editable when in edit mode */}
                        {isEditing ? (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, marginBottom: 6 }}>✏️ Editing draft — make any changes before approving</div>
                            <textarea
                              value={showAIModal.editedOutput ?? showAIModal.output}
                              onChange={e => setShowAIModal(prev => ({ ...prev, editedOutput: e.target.value }))}
                              style={{ width: "100%", minHeight: 140, padding: "10px 12px", fontSize: 14, lineHeight: 1.65, border: "1.5px solid var(--blue)", borderRadius: "var(--radius-sm)", resize: "vertical", fontFamily: "inherit", color: "var(--gray-800)", outline: "none", boxSizing: "border-box" }}
                            />
                          </div>
                        ) : (
                          <div className="ai-card" style={{ marginBottom: 14 }}>
                            <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{item.output}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                            disabled={aiActionLoading === item.id}
                            onClick={() => rejectAI(item.id)}>
                            <Icon name="x" size={13} color="#dc2626" />
                            {aiActionLoading === item.id ? "Rejecting…" : "Reject"}
                          </button>

                          {!isEditing ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowAIModal({ ...item, editedOutput: item.output })}>
                              <Icon name="edit" size={13} />Edit Draft
                            </button>
                          ) : (
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowAIModal(null)}>
                              Cancel Edit
                            </button>
                          )}

                          <button
                            className="btn btn-primary btn-sm"
                            disabled={aiActionLoading === item.id}
                            onClick={() => approveAI(item.id, isEditing ? (showAIModal.editedOutput ?? item.output) : item.output)}
                            style={{ marginLeft: "auto" }}>
                            <Icon name="check" size={13} />
                            {aiActionLoading === item.id ? "Approving…" : isEditing ? "Approve Edited Draft" : "Approve & Send"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
  );
}
