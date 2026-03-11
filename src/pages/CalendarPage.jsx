import { useState, useEffect, useRef } from "react";
import { Icon } from "../components/Icons";

export default function CalendarPage({
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
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Calendar</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>March 2026</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn btn-secondary btn-sm"><Icon name="chevron_left" size={14} /></button>
                  <button className="btn btn-secondary btn-sm"><Icon name="chevron_right" size={14} /></button>
                  <button className="btn btn-primary btn-sm" onClick={() => { setVideoCallContact({ name: "Sarah Johnson", matter: "Consultation" }); setShowVideoCall(true); }}><Icon name="plus" size={14} />Schedule Meeting</button>
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
                      { time: "2:00 PM", label: "Video call — Sarah Johnson", type: "video", color: "var(--blue)", matter: "Johnson Divorce", onClick: () => { setVideoCallContact({ name: "Sarah Johnson", matter: "Johnson Divorce Proceeding" }); setShowVideoCall(true); } },
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
  );
}
