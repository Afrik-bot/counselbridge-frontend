import { useState, useEffect, useRef } from "react";
import { DOCUMENTS } from "../lib/mockData";
import { Icon, StatusBadge } from "../components/Icons";

export default function DocumentsPage({
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
  const uploadRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("cb_token");
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      formData.append("accessLevel", "INTERNAL");
      // Upload to first matter by default, or show matter picker
      const matterId = matters[0]?.id;
      if (!matterId) { alert("No matters found. Create a matter first."); setUploading(false); return; }
      const res = await fetch(`${API_BASE}/api/documents/matters/${matterId}/upload`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.documents) {
        setDocuments(prev => ({ ...prev, [matterId]: [...(prev[matterId] || []), ...data.documents] }));
      } else {
        alert(data.error || "Upload failed");
      }
    } catch(e) { alert("Upload failed: " + e.message); }
    setUploading(false);
  };

  return (
            <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
              <input ref={uploadRef} type="file" multiple accept="*/*" style={{ display: "none" }} onChange={e => handleUpload(e.target.files)} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>Documents</h1>
                  <p style={{ fontSize: 13.5, color: "var(--gray-500)" }}>All matters · {Object.values(documents).flat().length + 12} files</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm"><Icon name="file" size={13} />Request Documents</button>
                  <button className="btn btn-primary" onClick={() => uploadRef.current?.click()} disabled={uploading}>
                    <Icon name="upload" size={15} />{uploading ? "Uploading…" : "Upload"}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
                {/* Folder tree */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, padding: "0 4px" }}>Matters</div>
                  {[
                    { label: "All Documents", count: 12, icon: "layers" },
                    { label: "Johnson Divorce", count: 5, icon: "folder" },
                    { label: "Martinez Estate", count: 3, icon: "folder" },
                    { label: "Chen v. Realty", count: 4, icon: "folder" },
                    { label: "Rodriguez Injury", count: 0, icon: "folder" },
                  ].map((folder, i) => (
                    <div key={folder.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer", background: i === 0 ? "var(--blue-pale)" : "transparent", marginBottom: 2 }}
                      onMouseEnter={e => { if(i !== 0) e.currentTarget.style.background = "var(--gray-100)"; }}
                      onMouseLeave={e => { if(i !== 0) e.currentTarget.style.background = "transparent"; }}>
                      <Icon name={folder.icon} size={14} color={i === 0 ? "var(--blue)" : "var(--gray-400)"} />
                      <span style={{ flex: 1, fontSize: 13.5, color: i === 0 ? "var(--blue)" : "var(--gray-700)", fontWeight: i === 0 ? 600 : 400 }}>{folder.label}</span>
                      <span style={{ fontSize: 11.5, color: i === 0 ? "var(--blue)" : "var(--gray-400)" }}>{folder.count}</span>
                    </div>
                  ))}

                  <div style={{ height: 1, background: "var(--gray-200)", margin: "14px 4px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, padding: "0 4px" }}>AI Labels</div>
                  {[
                    { label: "Financial", count: 4, color: "var(--green)" },
                    { label: "Court Filing", count: 2, color: "var(--red)" },
                    { label: "Contract", count: 2, color: "var(--blue)" },
                    { label: "ID Document", count: 1, color: "var(--purple)" },
                    { label: "Other", count: 3, color: "var(--gray-400)" },
                  ].map(tag => (
                    <div key={tag.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--gray-100)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: "var(--gray-600)" }}>{tag.label}</span>
                      <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{tag.count}</span>
                    </div>
                  ))}
                </div>

                {/* Document list */}
                <div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Icon name="search" size={14} color="var(--gray-400)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                      <input className="input" style={{ paddingLeft: 32, height: 36 }} placeholder="Search documents..." />
                    </div>
                    <select className="input select" style={{ width: 140, height: 36 }}>
                      <option>All types</option>
                      <option>Financial</option>
                      <option>Court Filing</option>
                      <option>Contract</option>
                    </select>
                    <select className="input select" style={{ width: 140, height: 36 }}>
                      <option>Newest first</option>
                      <option>Oldest first</option>
                      <option>Largest first</option>
                    </select>
                  </div>

                  {/* Missing doc alert */}
                  <div style={{ background: "var(--amber-pale)", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ai-badge"><Icon name="cpu" size={10} color="var(--purple)" />AI</span>
                    <span style={{ fontSize: 13, color: "#92400E" }}>MissingDocAgent detected 3 outstanding requests across 1 matter — Johnson Divorce (mortgage, retirement, business docs)</span>
                    <button className="btn btn-sm" style={{ background: "var(--amber)", color: "white", fontSize: 11.5, marginLeft: "auto" }}>View Requests</button>
                  </div>

                  {[
                    ...Object.values(DOCUMENTS).flat(),
                    { id: 10, name: "Martinez_Trust_v2.docx", type: "Contract", size: "0.2 MB", uploaded: "Mar 8", by: "Alex Rivera", aiLabel: "Legal Agreement", confidence: 0.94, shared: false },
                    { id: 11, name: "Chen_Evidence_Photos.zip", type: "Evidence", size: "14.2 MB", uploaded: "Mar 6", by: "Alex Rivera", aiLabel: "Evidence", confidence: 0.87, shared: false },
                    { id: 12, name: "Rodriguez_Medical_Records.pdf", type: "Medical", size: "3.8 MB", uploaded: "Mar 9", by: "Priya Patel", aiLabel: "Medical Record", confidence: 0.99, shared: false },
                    { id: 13, name: "Johnson_Settlement_Proposal.pdf", type: "Internal", size: "0.6 MB", uploaded: "Feb 29", by: "Alex Rivera", aiLabel: "Settlement Document", confidence: 0.91, shared: false },
                  ].map((doc, i) => (
                    <div key={doc.id + "-" + i} className="card card-hover" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <div style={{ width: 40, height: 40, background: doc.aiLabel === "Financial Statement" || doc.aiLabel === "Tax Document" ? "var(--green-pale)" : doc.aiLabel === "Court Filing" ? "var(--red-pale)" : doc.aiLabel === "Medical Record" ? "var(--purple-pale)" : "var(--blue-pale)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="file" size={17} color={doc.aiLabel === "Financial Statement" || doc.aiLabel === "Tax Document" ? "var(--green)" : doc.aiLabel === "Court Filing" ? "var(--red)" : doc.aiLabel === "Medical Record" ? "var(--purple)" : "var(--blue)"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                          {doc.name}
                          {doc.aiLabel === "Financial Statement" && <span className="badge badge-red" style={{ fontSize: 10 }}>Missing doc requested</span>}
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          <span className="ai-badge"><Icon name="tag" size={9} color="var(--purple)" />{doc.aiLabel}</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{Math.round(doc.confidence * 100)}%</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-300)" }}>·</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{doc.size}</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-300)" }}>·</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{doc.by}</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-300)" }}>·</span>
                          <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{doc.uploaded}</span>
                          <span className={"badge " + (doc.shared ? "badge-blue" : "badge-gray")} style={{ fontSize: 10 }}>{doc.shared ? "Client visible" : "Internal"}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-ghost btn-sm"><Icon name="eye" size={14} /></button>
                        <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /></button>
                        <button className="btn btn-ghost btn-sm"><Icon name="more-h" size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  );
}
