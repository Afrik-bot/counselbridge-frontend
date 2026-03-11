import { useState, useEffect, useRef } from "react";
import { Icon, StatusBadge } from "../components/Icons";


export default function BillingPage({
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
                  {/* Overdue alert — dynamic */}
                  {invoices.filter(i => i.status?.toUpperCase() === "OVERDUE").length > 0 && (
                    <div style={{ background: "var(--red-pale)", border: "1px solid #FECACA", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon name="alert-circle" size={16} color="var(--red)" />
                      <span style={{ fontSize: 13.5, color: "#991B1B", fontWeight: 500 }}>
                        {invoices.filter(i => i.status?.toUpperCase() === "OVERDUE").length} invoice{invoices.filter(i => i.status?.toUpperCase() === "OVERDUE").length !== 1 ? "s are" : " is"} overdue — automated reminders run daily
                      </span>
                      <button className="btn btn-sm" style={{ background: "var(--red)", color: "white", marginLeft: "auto", fontSize: 12 }}
                        onClick={async () => {
                          const token = localStorage.getItem("cb_token");
                          const res = await fetch("https://api.counselbridge.me/api/invoices/run-reminders", {
                            method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }
                          });
                          const data = await res.json();
                          alert(`Reminder pass complete: ${data.sent || 0} sent`);
                        }}>
                        Run Reminders Now
                      </button>
                    </div>
                  )}

                  {/* Filter tabs */}
                  {(() => {
                    const filtered = billingFilter === "All Invoices" ? invoices
                      : invoices.filter(i => i.status?.toUpperCase() === billingFilter.toUpperCase());
                    return (
                      <>
                        <div className="tab-bar" style={{ marginBottom: 14 }}>
                          {["All Invoices","OVERDUE","SENT","PAID","DRAFT"].map(t => (
                            <button key={t} className={"tab" + (billingFilter === t ? " active" : "")} onClick={() => setBillingFilter(t)}>
                              {t === "All Invoices" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                              {t !== "All Invoices" && invoices.filter(i => i.status?.toUpperCase() === t).length > 0 && (
                                <span style={{ marginLeft: 4, fontSize: 10, background: t === "OVERDUE" ? "var(--red)" : "var(--gray-200)", color: t === "OVERDUE" ? "white" : "var(--gray-600)", borderRadius: 10, padding: "1px 5px" }}>
                                  {invoices.filter(i => i.status?.toUpperCase() === t).length}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {filtered.map(inv => {
                            const matter = matters.find(m => m.id === inv.matterId);
                            const statusUp = inv.status?.toUpperCase();
                            const isOverdue = statusUp === "OVERDUE";
                            const isPaid = statusUp === "PAID";
                            const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
                            const daysOverdue = dueDate && isOverdue
                              ? Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                              : 0;
                            const clientName = matter?.members?.find(mb => mb.role === "client")?.user
                              ? `${matter.members.find(mb => mb.role === "client").user.firstName} ${matter.members.find(mb => mb.role === "client").user.lastName}`
                              : (matter?.client || "");
                            const reminderLabel = inv.remindersSent > 0
                              ? `${inv.remindersSent} reminder${inv.remindersSent !== 1 ? "s" : ""} sent${inv.lastReminderAt ? " · last " + new Date(inv.lastReminderAt).toLocaleDateString() : ""}`
                              : null;

                            return (
                              <div key={inv.id} className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, borderLeft: isOverdue ? "3px solid var(--red)" : undefined }}>
                                <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: isPaid ? "var(--green-pale)" : isOverdue ? "var(--red-pale)" : "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Icon name="dollar" size={18} color={isPaid ? "var(--green)" : isOverdue ? "var(--red)" : "var(--blue)"} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", marginBottom: 3 }}>
                                    {inv.description || inv.desc}
                                  </div>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{inv.number}</span>
                                    {clientName && <><span style={{ color: "var(--gray-300)" }}>·</span><span style={{ fontSize: 12.5, color: "var(--gray-500)" }}>{clientName}</span></>}
                                    <span style={{ color: "var(--gray-300)" }}>·</span>
                                    <span style={{ fontSize: 12.5, color: isOverdue ? "var(--red)" : "var(--gray-400)", fontWeight: isOverdue ? 600 : 400 }}>
                                      {isOverdue ? `${daysOverdue}d overdue` : dueDate ? `Due ${dueDate.toLocaleDateString()}` : ""}
                                    </span>
                                    {reminderLabel && (
                                      <span style={{ fontSize: 11.5, color: "var(--amber-600, #92400e)", background: "var(--amber-pale, #fffbeb)", padding: "1px 7px", borderRadius: 10, border: "1px solid #fde68a" }}>
                                        <Icon name="bell" size={10} color="#92400e" /> {reminderLabel}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>
                                  ${(inv.amountCents ? inv.amountCents / 100 : (inv.amount || 0)).toLocaleString()}
                                </div>
                                <StatusBadge status={inv.status} />
                                <div style={{ display: "flex", gap: 6 }}>
                                  {!isPaid && (
                                    <button className="btn btn-secondary btn-sm"
                                      onClick={async () => {
                                        const token = localStorage.getItem("cb_token");
                                        await fetch(`https://api.counselbridge.me/api/invoices/${inv.id}/remind`, {
                                          method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }
                                        });
                                        // Refresh invoices
                                        API.invoices().then(data => { if (data) setInvoices(Array.isArray(data) ? data : (data.invoices || [])); });
                                      }}>
                                      <Icon name="bell" size={12} />Remind
                                    </button>
                                  )}
                                  <button className="btn btn-ghost btn-sm"><Icon name="eye" size={13} /></button>
                                </div>
                              </div>
                            );
                          })}
                          {filtered.length === 0 && (
                            <div style={{ textAlign: "center", padding: 32, color: "var(--gray-400)", fontSize: 13.5 }}>No invoices in this category</div>
                          )}
                        </div>
                      </>
                    );
                  })()}
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
                    {matters.filter(m => (m.retainer > 0) || (m.customFields?.retainerAmount > 0)).map(m => { const retainer = m.retainer || m.customFields?.retainerAmount || 0; const paid = m.paid || 0; return (
                      <div key={m.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                          <span style={{ color: "var(--gray-700)", fontWeight: 500 }}>{m.client}</span>
                          <span style={{ color: "var(--gray-600)" }}>${(retainer - (retainer - paid > 0 ? retainer - paid : 0)).toLocaleString()} / ${retainer.toLocaleString()}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: (retainer > 0 ? paid / retainer * 100 : 0) + "%", background: retainer > 0 && paid / retainer < 0.3 ? "var(--red)" : retainer > 0 && paid / retainer < 0.6 ? "var(--amber)" : "var(--green)" }} />
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--gray-400)", marginTop: 3 }}>{retainer > 0 ? Math.round(paid / retainer * 100) : 0}% depleted</div>
                      </div>
                    ); })}
                    <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}><Icon name="plus" size={13} />Request Replenishment</button>
                  </div>
                </div>
              </div>
            </div>
  );
}
