import { useState, useEffect, useRef } from "react";
import { Icon } from "../components/Icons";


export default function SettingsPage({
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
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Firm Settings</h1>
                <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>Manage your firm profile, team, and platform preferences</p>
              </div>

              {/* Saved / Error banners */}
              {settingsSaved && (
                <div style={{ background: "var(--green-pale)", border: "1px solid var(--green)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 16, fontSize: 13.5, color: "var(--green)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="check" size={14} color="var(--green)" /> Settings saved successfully
                </div>
              )}
              {settingsError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 16, fontSize: 13.5, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="alert" size={14} color="#dc2626" /> {settingsError}
                  <button onClick={() => setSettingsError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>×</button>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, maxWidth: 960 }}>
                {/* Settings nav */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    ["Firm Profile", "briefcase", "profile"],
                    ["Team Members", "users", "team"],
                    ["Security & Access", "shield", "security"],
                    ["Notifications", "bell", "notifications"],
                    ["AI Configuration", "cpu", "ai"],
                    ["Integrations", "link", "integrations"],
                    ["Billing & Plan", "dollar", "billing-plan"],
                    ["Audit Log", "activity", "audit"],
                  ].map(([label, icon, key]) => (
                    <div key={key}
                      className="nav-item"
                      onClick={() => setActiveSettingsTab(key)}
                      style={{ background: activeSettingsTab === key ? "var(--blue-pale)" : "transparent", color: activeSettingsTab === key ? "var(--blue)" : "var(--gray-600)", padding: "9px 12px", cursor: "pointer", borderRadius: "var(--radius-sm)" }}>
                      <Icon name={icon} size={15} color={activeSettingsTab === key ? "var(--blue)" : "var(--gray-400)"} />
                      <span style={{ fontSize: 13.5 }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Settings content */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* ── FIRM PROFILE ── */}
                  {activeSettingsTab === "profile" && (
                    <>
                      <div className="card" style={{ padding: 24 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Firm Profile</div>

                        {/* Logo */}
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                          <div style={{ width: 72, height: 72, borderRadius: "var(--radius-md)", background: "var(--gray-100)", border: "1.5px solid var(--gray-200)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {logoUrl
                              ? <img src={logoUrl} alt="Firm logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                              : <Icon name="briefcase" size={28} color="var(--gray-300)" />
                            }
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-800)", marginBottom: 4 }}>Firm Logo</div>
                            <div style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 8 }}>PNG, JPG, SVG or WEBP · Max 5MB · Shown on client portal and emails</div>
                            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadLogo(e.target.files[0])} />
                            <button className="btn btn-secondary btn-sm" onClick={() => logoInputRef.current?.click()} disabled={logoUploading}>
                              <Icon name="upload" size={13} />
                              {logoUploading ? "Uploading…" : "Upload Logo"}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                          <div>
                            <label>Firm Name</label>
                            <input className="input" value={firmForm.name} onChange={e => setFirmForm(p => ({ ...p, name: e.target.value }))} placeholder="Your Firm Name" />
                          </div>
                          <div>
                            <label>Portal Slug</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                              <span style={{ background: "var(--gray-100)", border: "1.5px solid var(--gray-200)", borderRight: "none", borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)", padding: "0 10px", height: 38, display: "flex", alignItems: "center", fontSize: 13, color: "var(--gray-400)", whiteSpace: "nowrap" }}>counselbridge.me/p/</span>
                              <input className="input" value={firmForm.slug} onChange={e => setFirmForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} placeholder="your-firm" style={{ borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", flex: 1 }} />
                            </div>
                          </div>
                          <div>
                            <label>Practice Area(s)</label>
                            <input className="input" value={firmForm.practiceAreas} onChange={e => setFirmForm(p => ({ ...p, practiceAreas: e.target.value }))} placeholder="Family Law, Litigation, Estate Planning…" />
                          </div>
                          <div>
                            <label>Firm Phone</label>
                            <input className="input" value={firmForm.phone} onChange={e => setFirmForm(p => ({ ...p, phone: e.target.value }))} placeholder="(415) 555-0000" />
                          </div>
                          <div>
                            <label>State Bar Number</label>
                            <input className="input" value={firmForm.barNumber} onChange={e => setFirmForm(p => ({ ...p, barNumber: e.target.value }))} placeholder="CA Bar #000000" />
                          </div>
                          <div>
                            <label>Jurisdiction</label>
                            <input className="input" value={firmForm.jurisdiction} onChange={e => setFirmForm(p => ({ ...p, jurisdiction: e.target.value }))} placeholder="California" />
                          </div>
                          <div>
                            <label>Website</label>
                            <input className="input" value={firmForm.website} onChange={e => setFirmForm(p => ({ ...p, website: e.target.value }))} placeholder="https://yourfirm.com" />
                          </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <label>Firm Address</label>
                          <input className="input" value={firmForm.address} onChange={e => setFirmForm(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St, Suite 100, San Francisco, CA 94102" />
                        </div>

                        {firmStats && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16, padding: "14px 0", borderTop: "1px solid var(--gray-100)", borderBottom: "1px solid var(--gray-100)" }}>
                            {[
                              ["Active Matters", firmStats.activeMatters],
                              ["Team Members", firmStats.teamCount],
                              ["Outstanding", `$${((firmStats.outstandingInvoices?.amountCents || 0) / 100).toLocaleString()}`],
                              ["Paid This Month", `$${((firmStats.paidThisMonth?.amountCents || 0) / 100).toLocaleString()}`],
                            ].map(([label, val]) => (
                              <div key={label} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)" }}>{val}</div>
                                <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{label}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-primary btn-sm" onClick={saveFirmProfile} disabled={settingsSaving}>
                            {settingsSaving ? "Saving…" : "Save Changes"}
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => window.open(`https://counselbridge.me/p/${firmForm.slug}`, "_blank")}>
                            Preview Portal
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── TEAM MEMBERS ── */}
                  {activeSettingsTab === "team" && (
                    <>
                      <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>Team Members</div>
                          <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}</span>
                        </div>

                        {teamLoading ? (
                          <div style={{ textAlign: "center", padding: 32, color: "var(--gray-400)" }}>Loading team…</div>
                        ) : teamMembers.length === 0 ? (
                          <div style={{ textAlign: "center", padding: 32, color: "var(--gray-400)" }}>No team members yet</div>
                        ) : teamMembers.map(member => (
                          <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }}>{member.firstName[0]}{member.lastName[0]}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-800)" }}>{member.firstName} {member.lastName}</div>
                              <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{member.email} {member.lastActiveAt ? `· Active ${new Date(member.lastActiveAt).toLocaleDateString()}` : "· Never logged in"}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: member.role === "OWNER" ? "var(--navy)" : member.role === "ATTORNEY" ? "var(--blue-pale)" : "var(--gray-100)", color: member.role === "OWNER" ? "white" : member.role === "ATTORNEY" ? "var(--blue)" : "var(--gray-600)", fontWeight: 600 }}>
                                {member.role}
                              </span>
                              {member.mfaEnabled && <Icon name="shield" size={12} color="var(--green)" title="MFA enabled" />}
                              {member.id !== currentUser?.id && member.role !== "OWNER" && (
                                <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: "var(--red, #dc2626)" }}
                                  onClick={async () => { if (window.confirm(`Remove ${member.firstName} ${member.lastName}?`)) { try { const token = localStorage.getItem('cb_token'); await fetch(`${API_BASE}/api/firms/me/team/${member.id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }); loadTeam(); } catch(e) { console.error('Remove failed', e); } } }}>
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="card" style={{ padding: 24 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 16 }}>Invite Team Member</div>
                        {inviteMsg && (
                          <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", marginBottom: 14, fontSize: 13, background: inviteMsg.startsWith("✓") ? "var(--green-pale)" : "#fef2f2", color: inviteMsg.startsWith("✓") ? "var(--green)" : "#dc2626" }}>
                            {inviteMsg}
                          </div>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                          <div><label>First Name</label><input className="input" value={inviteForm.firstName} onChange={e => setInviteForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Jane" /></div>
                          <div><label>Last Name</label><input className="input" value={inviteForm.lastName} onChange={e => setInviteForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Smith" /></div>
                          <div><label>Email</label><input className="input" type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@yourfirm.com" /></div>
                          <div>
                            <label>Role</label>
                            <select className="input" value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}>
                              <option value="ATTORNEY">Attorney</option>
                              <option value="PARALEGAL">Paralegal</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={inviteMember} disabled={inviting || !inviteForm.email}>
                          <Icon name="mail" size={13} />
                          {inviting ? "Sending invite…" : "Send Invitation"}
                        </button>
                      </div>
                    </>
                  )}

                  {/* ── SECURITY ── */}
                  {activeSettingsTab === "security" && (
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Security & Access</div>
                      {[
                        { label: "Multi-Factor Authentication", desc: "Required for all attorney accounts", key: "mfa", enabled: true },
                        { label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", key: "timeout", enabled: true },
                        { label: "Login Alerts", desc: "Email notification on new device login", key: "loginAlerts", enabled: true },
                        { label: "Client Magic Links", desc: "Allow clients to login without a password via email link", key: "magicLinks", enabled: false },
                        { label: "IP Allowlisting", desc: "Restrict attorney access to approved IP ranges", key: "ipAllowlist", enabled: false },
                      ].map(s => (
                        <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)" }}>{s.label}</div>
                            <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{s.desc}</div>
                          </div>
                          <div style={{ width: 44, height: 24, borderRadius: 12, background: s.enabled ? "var(--blue)" : "var(--gray-200)", cursor: "pointer", position: "relative", flexShrink: 0 }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: s.enabled ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--blue-pale)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--blue)" }}>
                        <strong>MFA enforcement</strong> coming in next release. Attorneys will be prompted to set up TOTP on next login.
                      </div>
                    </div>
                  )}

                  {/* ── NOTIFICATIONS ── */}
                  {activeSettingsTab === "notifications" && (
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Notification Preferences</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "10px 24px", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Event</div>
                        {["In-App", "Email", "SMS"].map(h => (
                          <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>{h}</div>
                        ))}
                        {[
                          ["New client message", "newMessage"],
                          ["Document uploaded", "documentUploaded"],
                          ["Invoice paid", "invoicePaid"],
                          ["Deadline in 48 hours", "deadline48h"],
                          ["AI queue item", "aiQueue"],
                          ["Meeting reminder (1h)", "meetingReminder"],
                          ["New intake submission", "newIntake"],
                        ].map(([label, key]) => (
                          <>
                            <div key={label} style={{ fontSize: 13.5, color: "var(--gray-700)" }}>{label}</div>
                            {["inApp", "email", "sms"].map(ch => {
                              const val = notifPrefs[key]?.[ch] ?? false;
                              return (
                                <div key={ch}
                                  onClick={() => setNotifPrefs(p => ({ ...p, [key]: { ...p[key], [ch]: !val } }))}
                                  style={{ width: 36, height: 20, borderRadius: 10, background: val ? "var(--blue)" : "var(--gray-200)", cursor: "pointer", position: "relative", margin: "0 auto", transition: "background 0.2s" }}>
                                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: val ? 19 : 3, transition: "left 0.2s" }} />
                                </div>
                              );
                            })}
                          </>
                        ))}
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={saveAgentSettings} disabled={settingsSaving} style={{ marginTop: 8 }}>
                        {settingsSaving ? "Saving…" : "Save Preferences"}
                      </button>
                    </div>
                  )}

                  {/* ── AI CONFIG ── */}
                  {activeSettingsTab === "ai" && (
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 6 }}>AI Configuration</div>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 18 }}>Configure which AI agents are active. All client-facing AI output requires attorney approval before delivery.</div>
                      {[
                        { name: "MessageDraftAgent", desc: "Draft reply suggestions when you open a message thread", zone: 2 },
                        { name: "PlainLanguageAgent", desc: "Rewrite case updates in plain English for clients", zone: 2 },
                        { name: "DigestAgent", desc: "Send daily matter briefing at 7:00 AM", zone: 1 },
                        { name: "UrgencyClassifier", desc: "Score intake forms for urgency and practice area", zone: 1 },
                        { name: "DocumentTagger", desc: "Auto-classify uploaded document types", zone: 1 },
                        { name: "ClientChatAgent", desc: "Answer client process questions in the portal (never legal advice)", zone: 2 },
                        { name: "MeetingSummaryAgent", desc: "Generate meeting summaries from transcripts (Phase 2)", zone: 2 },
                      ].map(agent => (
                        <div key={agent.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-800)", display: "flex", alignItems: "center", gap: 6 }}>
                              <span className="ai-badge" style={{ fontSize: 10 }}><Icon name="cpu" size={9} color="var(--purple)" />AI</span>
                              {agent.name}
                              {agent.zone === 2 && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: "var(--yellow-pale, #fefce8)", color: "var(--yellow-600, #ca8a04)", fontWeight: 600 }}>Requires Approval</span>}
                            </div>
                            <div style={{ fontSize: 12.5, color: "var(--gray-400)", marginTop: 2 }}>{agent.desc}</div>
                          </div>
                          <div
                            onClick={() => setAgentToggles(p => ({ ...p, [agent.name]: !p[agent.name] }))}
                            style={{ width: 44, height: 24, borderRadius: 12, background: agentToggles[agent.name] ? "var(--purple)" : "var(--gray-200)", cursor: "pointer", position: "relative", flexShrink: 0, marginLeft: 16, marginTop: 2, transition: "background 0.2s" }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: agentToggles[agent.name] ? 23 : 3, transition: "left 0.2s" }} />
                          </div>
                        </div>
                      ))}
                      <button className="btn btn-primary btn-sm" onClick={saveAgentSettings} disabled={settingsSaving} style={{ marginTop: 16 }}>
                        {settingsSaving ? "Saving…" : "Save AI Settings"}
                      </button>
                    </div>
                  )}

                  {/* ── INTEGRATIONS ── */}
                  {activeSettingsTab === "integrations" && (
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Integrations</div>
                      {[
                        { name: "Google Calendar", desc: "Sync meetings and deadlines", icon: "calendar", connected: true, note: "Syncing 3 calendars" },
                        { name: "Stripe", desc: "Payment processing for invoices", icon: "dollar", connected: true, note: "Live mode active" },
                        { name: "Microsoft Outlook", desc: "Calendar and email sync", icon: "mail", connected: false },
                        { name: "Dropbox Sign", desc: "E-signature workflows (Phase 2)", icon: "file", connected: false },
                        { name: "Clio", desc: "Practice management sync", icon: "briefcase", connected: false },
                        { name: "Twilio SMS", desc: "Client text notifications", icon: "phone", connected: false },
                      ].map(intg => (
                        <div key={intg.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
                          <div style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", background: intg.connected ? "var(--green-pale)" : "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon name={intg.icon} size={16} color={intg.connected ? "var(--green)" : "var(--gray-400)"} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)" }}>{intg.name}</div>
                            <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{intg.connected ? intg.note : intg.desc}</div>
                          </div>
                          {intg.connected
                            ? <span className="badge badge-green" style={{ fontSize: 11 }}>Connected</span>
                            : <button className="btn btn-secondary btn-sm">Connect</button>
                          }
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── BILLING & PLAN ── */}
                  {activeSettingsTab === "billing-plan" && (
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 18 }}>Billing & Plan</div>
                      <div style={{ padding: "16px 20px", background: "var(--blue-pale)", borderRadius: "var(--radius-md)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--blue)" }}>{(currentFirm?.plan || "STARTER")} Plan</div>
                          <div style={{ fontSize: 13, color: "var(--blue)", opacity: 0.8, marginTop: 2 }}>{teamMembers.length} seat{teamMembers.length !== 1 ? "s" : ""} · All MVP features included</div>
                        </div>
                        <button className="btn btn-primary btn-sm">Upgrade Plan</button>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Billing managed through Stripe. Contact <a href="mailto:support@counselbridge.me" style={{ color: "var(--blue)" }}>support@counselbridge.me</a> for invoicing or plan changes.</div>
                    </div>
                  )}

                  {/* ── AUDIT LOG ── */}
                  {activeSettingsTab === "audit" && (
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>Audit Log</div>
                        <button className="btn btn-secondary btn-sm" onClick={loadAuditLog} disabled={auditLoading}>
                          <Icon name="refresh" size={13} /> Refresh
                        </button>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 16 }}>Immutable record of all platform actions · Retained 7 years</div>

                      {auditLoading ? (
                        <div style={{ textAlign: "center", padding: 32, color: "var(--gray-400)" }}>Loading audit log…</div>
                      ) : auditLogs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 32, color: "var(--gray-400)" }}>No audit log entries yet</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {auditLogs.map((log, i) => {
                            const actionType = log.action?.split(".")[0] || "other";
                            const colors = { firm: "var(--blue)", message: "var(--teal)", document: "var(--blue)", invoice: "var(--green)", ai: "var(--purple)", auth: "var(--navy)" };
                            const icons = { firm: "briefcase", message: "message", document: "file", invoice: "dollar", ai: "cpu", auth: "lock" };
                            const bgColors = { firm: "var(--blue-pale)", message: "var(--teal-pale)", document: "var(--blue-pale)", invoice: "var(--green-pale)", ai: "var(--purple-pale)", auth: "var(--gray-100)" };
                            const c = colors[actionType] || "var(--gray-400)";
                            const ic = icons[actionType] || "activity";
                            const bg = bgColors[actionType] || "var(--gray-100)";
                            return (
                              <div key={log.id} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: i < auditLogs.length - 1 ? "1px solid var(--gray-100)" : "none", alignItems: "flex-start" }}>
                                <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                  <Icon name={ic} size={13} color={c} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13.5, color: "var(--gray-800)" }}>
                                    <span style={{ fontWeight: 600 }}>{log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}</span>
                                    {" — "}
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--gray-100)", padding: "1px 5px", borderRadius: 4 }}>{log.action}</span>
                                  </div>
                                  <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{new Date(log.createdAt).toLocaleString()} {log.ipAddress ? `· ${log.ipAddress}` : ""}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }}
                        onClick={() => {
                          const csv = ["timestamp,user,action,entity_id,ip", ...auditLogs.map(l => `${l.createdAt},"${l.user ? l.user.firstName + " " + l.user.lastName : "System"}",${l.action},${l.entityId||""},${l.ipAddress||""}`)].join("\n");
                          const a = document.createElement("a");
                          a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
                          a.download = `counselbridge-audit-${new Date().toISOString().split("T")[0]}.csv`;
                          a.click();
                        }}>
                        <Icon name="download" size={13} />Export Audit Log (CSV)
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
  );
}
