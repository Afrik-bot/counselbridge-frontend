import { useState, useRef } from "react";
import { Icon, StatusBadge, Avatar } from "./Icons";

const API_BASE = "https://api.counselbridge.me";

const MatterDetail = ({ matter, messages, documents, invoices, showInternal, setShowInternal, aiTyping, aiDraft, setAiDraft, newMsg, setNewMsg, msgEndRef, sendMessage, generateAIDraft, matterTab, setMatterTab, setShowVideoCall, setVideoCallContact, setShowInvoiceModal, currentUser, DOC_REQUESTS, TIMELINE, uploadInputRef, uploading, setUploading, setDocuments }) => {
  // Normalize real API fields to local display names
  const mRef = matter.referenceCode || matter.ref || "";
  const mPractice = matter.practiceArea || matter.practice || "";
  const mStatus = matter.status || "";
  const mClient = matter.client || (matter.members?.find(mb => mb.role === "client")?.user
    ? `${matter.members.find(mb => mb.role === "client").user.firstName} ${matter.members.find(mb => mb.role === "client").user.lastName}`.trim()
    : "");
  const mClientEmail = matter.clientEmail || (matter.members?.find(mb => mb.role === "client")?.user?.email || "");
  const mAttorney = matter.attorney || (matter.members?.find(mb => mb.role === "lead_attorney")?.user
    ? `${matter.members.find(mb => mb.role === "lead_attorney").user.firstName} ${matter.members.find(mb => mb.role === "lead_attorney").user.lastName}`.trim()
    : (currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "Attorney"));
  const mNextStepClient = matter.nextStep || matter.nextStepClient || "No client-facing update yet.";
  const mNextStepInternal = matter.nextStepInternal || "No internal notes yet.";

  const matterMsgs = (messages[matter.id] || []);
  const visibleMsgs = showInternal ? matterMsgs : matterMsgs.filter(m => !m.internal);
  // Documents: from state (loaded via API) or from matter object directly
  const matterDocs = documents[matter.id] || matter.documents || [];
  const docs = matterDocs;
  // Doc requests: from matter object (returned by GET /api/matters/:id) or empty
  const reqs = (matter.docRequests || DOC_REQUESTS[matter.id] || []).map(r => ({
    ...r,
    done: !!(r.completedAt || r.done),
    label: r.label || r.description || "Document"
  }));
  // Invoices: filter from global invoices state by matterId
  const inv = invoices.filter(i => i.matterId === matter.id || i.matterId === matter._id);
  // Timeline: from matter.events (returned by GET /api/matters/:id) or mock
  const tl = matter.events || TIMELINE[matter.id] || [];

  // Upload ref for this matter (stable - defined outside)
  // uploadInputRef and uploading come from parent scope

  const handleUpload = async (files, accessLevel = "INTERNAL") => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("cb_token");
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      formData.append("accessLevel", accessLevel);
      const res = await fetch(`https://api.counselbridge.me/api/documents/matters/${matter.id}/upload`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.documents) {
        setDocuments(prev => ({ ...prev, [matter.id]: [...(prev[matter.id] || []), ...data.documents] }));
      } else {
        console.error("Upload error:", data?.error);
      }
    } catch(e) { console.error("Upload failed", e); }
    setUploading(false);
  };

  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem("cb_token");
      const res = await fetch(`https://api.counselbridge.me/api/documents/${doc.id}/download`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (data.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = data.filename;
        a.target = "_blank";
        a.click();
      }
    } catch(e) { console.error("Download failed", e); }
  };

  const handleView = async (doc) => {
    try {
      const token = localStorage.getItem("cb_token");
      const res = await fetch(`https://api.counselbridge.me/api/documents/${doc.id}/view`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank");
    } catch(e) { console.error("View failed", e); }
  };

  const toggleDocAccess = async (doc) => {
    const newLevel = doc.accessLevel === "INTERNAL" ? "CLIENT_VISIBLE" : "INTERNAL";
    try {
      const token = localStorage.getItem("cb_token");
      const res = await fetch(`https://api.counselbridge.me/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ accessLevel: newLevel })
      });
      if (res.ok) {
        setDocuments(prev => ({
          ...prev,
          [matter.id]: (prev[matter.id] || []).map(d => d.id === doc.id ? { ...d, accessLevel: newLevel } : d)
        }));
      }
    } catch(e) { console.error("Access update failed", e); }
  };

  return (
    <div className="fade-in" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Matter header */}
      <div style={{ background: "var(--white)", borderBottom: "1px solid var(--gray-200)", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 6, paddingLeft: 0 }} onClick={() => setSelectedMatter(null)}>
              <Icon name="arrow_left" size={14} />Back to matters
            </button>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--navy)", marginBottom: 4 }}>{matter.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{mRef}</span>
              <span style={{ color: "var(--gray-300)" }}>·</span>
              <span style={{ fontSize: 12.5, color: "var(--gray-500)" }}>{mPractice}</span>
              <span style={{ color: "var(--gray-300)" }}>·</span>
              <StatusBadge status={mStatus} />
              {matter.urgency === "high" && <StatusBadge status="high" />}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setVideoCallContact({ name: mClient || "Client", matter: matter.title }); setShowVideoCall(true); }}><Icon name="video" size={14} />Schedule Call</button>
            <button className="btn btn-primary btn-sm"><Icon name="edit" size={14} />Update Status</button>
          </div>
        </div>
        <div className="tab-bar">
          {["overview", "messages", "documents", "timeline", "billing"].map(t => (
            <button key={t} className={`tab ${matterTab === t ? "active" : ""}`} onClick={() => setMatterTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "messages" && matterMsgs.filter(m => !m.read).length > 0 && (
                <span className="badge badge-red" style={{ marginLeft: 5, padding: "1px 5px", fontSize: 10 }}>{matterMsgs.filter(m => !m.read).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-y" style={{ flex: 1, padding: 24 }}>
        {/* OVERVIEW */}
        {matterTab === "overview" && (
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Client</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={mClient || "Client"} size={44} color="teal" />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-900)" }}>{mClient || "Client"}</div>
                    <div style={{ fontSize: 13.5, color: "var(--gray-500)" }}>{mClientEmail}</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button className="btn btn-secondary btn-sm"><Icon name="message" size={13} /></button>
                    <button className="btn btn-secondary btn-sm"><Icon name="phone" size={13} /></button>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Next Steps</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "var(--blue-pale)", border: "1.5px solid var(--blue-pale2)", borderRadius: "var(--radius-md)", padding: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>👤 Client sees</div>
                    <p style={{ fontSize: 13.5, color: "var(--gray-700)", lineHeight: 1.6 }}>{mNextStepClient}</p>
                    <button className="btn btn-sm" style={{ background: "var(--blue)", color: "white", marginTop: 10, fontSize: 12 }}>
                      <Icon name="cpu" size={12} />Generate Update
                    </button>
                  </div>
                  <div style={{ background: "var(--amber-pale)", border: "1.5px solid #FDE68A", borderRadius: "var(--radius-md)", padding: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>🔒 Internal only</div>
                    <p style={{ fontSize: 13.5, color: "var(--gray-700)", lineHeight: 1.6 }}>{mNextStepInternal}</p>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Document Progress</div>
                {reqs.length > 0 ? (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--gray-500)", marginBottom: 5 }}>
                        <span>{reqs.filter(r => r.done).length} of {reqs.length} received</span>
                        <span style={{ color: reqs.filter(r => !r.done).length > 0 ? "var(--amber)" : "var(--green)" }}>{reqs.filter(r => !r.done).length > 0 ? `${reqs.filter(r => !r.done).length} outstanding` : "All received ✓"}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${(reqs.filter(r => r.done).length / reqs.length) * 100}%`, background: reqs.filter(r => !r.done).length > 0 ? "var(--amber)" : "var(--green)" }} /></div>
                    </div>
                    {reqs.map(req => (
                      <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13.5 }}>
                        <Icon name={req.done ? "check-circle" : "alert-circle"} size={15} color={req.done ? "var(--green)" : "var(--amber)"} />
                        <span style={{ color: req.done ? "var(--gray-500)" : "var(--gray-700)", textDecoration: req.done ? "line-through" : "none" }}>{req.label}</span>
                      </div>
                    ))}
                  </>
                ) : <p style={{ fontSize: 13.5, color: "var(--gray-400)" }}>No document requests for this matter</p>}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Key Dates</div>
                {matter.nextDeadline ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--red-pale)", borderRadius: "var(--radius-sm)", border: "1px solid #FECACA" }}>
                    <Icon name="clock" size={16} color="var(--red)" />
                    <span style={{ fontSize: 13.5, color: "#991B1B", fontWeight: 500 }}>{matter.nextDeadline}</span>
                  </div>
                ) : <p style={{ fontSize: 13.5, color: "var(--gray-400)" }}>No upcoming deadlines</p>}
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center", fontSize: 12 }}><Icon name="plus" size={12} />Add Deadline</button>
                </div>
              </div>

              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Billing Summary</div>
                {[["Retainer", `$${(matter.retainer || matter.customFields?.retainerAmount || 0).toLocaleString()}`], ["Billed", `$${inv.reduce((s,i) => s + (i.amountCents ? i.amountCents/100 : (i.amount || 0)), 0).toLocaleString()}`], ["Collected", `$${(matter.paid || 0).toLocaleString()}`], ["Outstanding", `$${inv.filter(i => i.status?.toUpperCase() !== "PAID").reduce((s,i) => s + (i.amountCents ? i.amountCents/100 : (i.amount || 0)), 0).toLocaleString()}`]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--gray-100)", fontSize: 13.5 }}>
                    <span style={{ color: "var(--gray-500)" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: k === "Outstanding" && inv.filter(i => i.status?.toUpperCase() !== "PAID").length > 0 ? "var(--red)" : "var(--gray-800)" }}>{v}</span>
                  </div>
                ))}
                <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 12, fontSize: 12 }} onClick={() => setShowInvoiceModal(true)}><Icon name="plus" size={12} />Create Invoice</button>
              </div>

              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Matter Team</div>
                {[{ name: mAttorney, role: "Lead Attorney", color: "blue" }].concat(matter.members?.filter(mb => mb.role === "paralegal" || mb.role === "PARALEGAL").map(mb => ({ name: `${mb.user?.firstName || ""} ${mb.user?.lastName || ""}`.trim(), role: "Paralegal", color: "teal" })) || []).map(m => (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                    <Avatar name={m.name} size={28} color={m.color} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-800)" }}>{m.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{m.role}</div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 6, fontSize: 12 }}><Icon name="plus" size={12} />Add team member</button>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {matterTab === "messages" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 260px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button className={`btn btn-sm ${!showInternal ? "btn-primary" : "btn-secondary"}`} onClick={() => setShowInternal(false)}>Client Thread</button>
                <button className={`btn btn-sm ${showInternal ? "btn-primary" : "btn-secondary"}`} onClick={() => setShowInternal(true)}>🔒 Internal Notes</button>
              </div>
              {aiTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--purple)" }}>
                  <div className="ai-typing"><span /><span /><span /></div>
                  AI is drafting...
                </div>
              )}
            </div>
            <div className="card" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="scroll-y" style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleMsgs.map(msg => (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "attorney" ? "flex-end" : "flex-start", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: msg.sender === "attorney" ? 0 : 4, paddingRight: msg.sender === "attorney" ? 4 : 0 }}>
                      {msg.sender !== "attorney" && <Avatar name={msg.name} size={22} color={msg.sender === "staff" ? "amber" : "teal"} />}
                      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{msg.name} · {msg.time}</span>
                      {msg.sender === "attorney" && msg.aiGenerated && <span className="ai-badge"><Icon name="cpu" size={10} color="var(--purple)" />AI</span>}
                    </div>
                    <div className={`msg-bubble ${msg.sender === "attorney" ? "sent" : msg.internal ? "internal" : "received"}`}>
                      {msg.body}
                    </div>
                    {msg.sender !== "attorney" && !msg.read && (
                      <span style={{ fontSize: 11, color: "var(--blue)" }}>● New</span>
                    )}
                  </div>
                ))}
                {aiDraft && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span className="ai-badge"><Icon name="cpu" size={10} color="var(--purple)" />AI Draft — review before sending</span>
                    <div className="msg-bubble sent" style={{ background: "linear-gradient(135deg, #7C3AED, #2563EB)", opacity: 0.85, border: "2px dashed rgba(255,255,255,0.3)" }}>
                      {aiDraft}
                    </div>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid var(--gray-200)" }}>
                {showInternal && (
                  <div style={{ background: "var(--amber-pale)", border: "1px solid #FDE68A", borderRadius: "var(--radius-sm)", padding: "6px 10px", marginBottom: 8, fontSize: 12, color: "#92400E", display: "flex", gap: 6, alignItems: "center" }}>
                    <Icon name="lock" size={12} color="#D97706" />
                    Internal note — not visible to client
                  </div>
                )}
                {aiDraft ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="btn btn-danger btn-sm" onClick={() => setAiDraft("")}><Icon name="x" size={13} />Dismiss</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setNewMsg(aiDraft); setAiDraft(""); }}><Icon name="edit" size={13} />Edit</button>
                    <button className="btn btn-primary btn-sm" onClick={sendMessage}><Icon name="send" size={13} />Send as-is</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <textarea className="input textarea" style={{ flex: 1, minHeight: 60, resize: "none", fontSize: 13.5 }} placeholder={showInternal ? "Add an internal note..." : "Write a message to the client..."} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button className="btn btn-purple btn-sm" onClick={generateAIDraft} title="Generate AI Draft"><Icon name="cpu" size={14} /></button>
                      <button className="btn btn-secondary btn-sm"><Icon name="paperclip" size={14} /></button>
                      <button className="btn btn-secondary btn-sm"><Icon name="mic" size={14} /></button>
                      <button className="btn btn-primary btn-sm" onClick={sendMessage}><Icon name="send" size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {matterTab === "documents" && (() => {
          const [dragOver, setDragOver] = useState(false);
          const [uploadAccess, setUploadAccess] = useState("INTERNAL");
          return (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)" }}>Matter Documents</h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={uploadAccess} onChange={e => setUploadAccess(e.target.value)}
                  style={{ fontSize: 12, padding: "4px 8px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", color: "var(--gray-700)", background: "white", cursor: "pointer" }}>
                  <option value="INTERNAL">Internal only</option>
                  <option value="CLIENT_VISIBLE">Share with client</option>
                </select>
                <input ref={uploadInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" style={{ display: "none" }} onChange={e => handleUpload(e.target.files, uploadAccess)} />
                <button className="btn btn-primary btn-sm" onClick={() => uploadInputRef.current?.click()} disabled={uploading}>
                  <Icon name="upload" size={13} />{uploading ? "Uploading…" : "Upload Files"}
                </button>
              </div>
            </div>

            {/* Drag & drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files, uploadAccess); }}
              style={{
                border: `2px dashed ${dragOver ? "var(--blue)" : "var(--gray-200)"}`,
                borderRadius: "var(--radius-md)",
                padding: "20px",
                textAlign: "center",
                background: dragOver ? "var(--blue-pale)" : "var(--gray-50)",
                marginBottom: 16,
                transition: "all 150ms ease",
                cursor: "pointer",
              }}
              onClick={() => uploadInputRef.current?.click()}
            >
              <Icon name="upload" size={22} color={dragOver ? "var(--blue)" : "var(--gray-300)"} />
              <p style={{ marginTop: 8, fontSize: 13, color: dragOver ? "var(--blue)" : "var(--gray-400)" }}>
                {dragOver ? "Drop files to upload" : "Drag & drop files here, or click to browse"}
              </p>
              <p style={{ fontSize: 11.5, color: "var(--gray-300)", marginTop: 4 }}>PDF, Word, Excel, images — up to 25 MB each</p>
            </div>

            {/* Document list */}
            <div style={{ display: "grid", gap: 8 }}>
              {docs.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--gray-400)", fontSize: 14 }}>
                  <Icon name="file" size={32} color="var(--gray-300)" />
                  <p style={{ marginTop: 10 }}>No documents yet. Upload the first one above.</p>
                </div>
              )}
              {docs.map(doc => {
                const isClientVisible = doc.accessLevel === "CLIENT_VISIBLE" || doc.shared;
                const isViewable = ["application/pdf","image/jpeg","image/png","image/webp"].includes(doc.mimeType);
                const uploaderName = doc.uploadedBy
                  ? `${doc.uploadedBy.firstName || ""} ${doc.uploadedBy.lastName || ""}`.trim()
                  : (doc.by || "");
                const fileSizeLabel = doc.sizeBytes
                  ? doc.sizeBytes > 1024 * 1024
                    ? `${(doc.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                    : `${(doc.sizeBytes / 1024).toFixed(0)} KB`
                  : doc.size || "";
                return (
                  <div key={doc.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, background: "var(--blue-pale)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="file" size={18} color="var(--blue)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-800)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.filename || doc.name || "Document"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {doc.aiLabel && (
                          <span className="badge badge-purple" style={{ fontSize: 10 }}>
                            <Icon name="tag" size={9} color="var(--purple)" /> {doc.aiLabel}
                            {doc.aiConfidence && <span style={{ opacity: 0.7 }}> · {Math.round(doc.aiConfidence * 100)}%</span>}
                          </span>
                        )}
                        {uploaderName && <span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>by {uploaderName}</span>}
                        {fileSizeLabel && <><span style={{ fontSize: 11, color: "var(--gray-300)" }}>·</span><span style={{ fontSize: 11.5, color: "var(--gray-400)" }}>{fileSizeLabel}</span></>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      {/* Share toggle — attorneys only */}
                      {currentUser?.role !== "CLIENT" && (
                        <button
                          className={`btn btn-sm ${isClientVisible ? "btn-secondary" : "btn-ghost"}`}
                          style={{ fontSize: 11.5 }}
                          title={isClientVisible ? "Remove client access" : "Share with client"}
                          onClick={() => toggleDocAccess(doc)}
                        >
                          <Icon name="eye" size={13} color={isClientVisible ? "var(--blue)" : "var(--gray-400)"} />
                          {isClientVisible ? "Shared" : "Share"}
                        </button>
                      )}
                      {isViewable && (
                        <button className="btn btn-ghost btn-sm" title="View in browser" onClick={() => handleView(doc)}>
                          <Icon name="eye" size={14} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" title="Download" onClick={() => handleDownload(doc)}>
                        <Icon name="download" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })()}

        {/* TIMELINE */}
        {matterTab === "timeline" && (
          <div className="fade-in" style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {tl.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-400)", fontSize: 14 }}><p>No timeline events yet.</p></div>}
              {tl.map((ev, i) => (
                <div key={ev.id} className="timeline-item" style={{ paddingBottom: i < tl.length - 1 ? 22 : 0 }}>
                  <div className="timeline-dot" style={{ background: ev.color === "blue" ? "var(--blue-pale2)" : ev.color === "green" ? "var(--green-pale)" : ev.color === "purple" ? "var(--purple-pale)" : ev.color === "teal" ? "var(--teal-pale)" : "var(--gray-100)" }}>
                    <Icon name={ev.icon} size={14} color={ev.color === "blue" ? "var(--blue)" : ev.color === "green" ? "var(--green)" : ev.color === "purple" ? "var(--purple)" : ev.color === "teal" ? "var(--teal)" : "var(--gray-500)"} />
                  </div>
                  <div style={{ paddingTop: 7, flex: 1 }}>
                    <div style={{ fontSize: 14, color: "var(--gray-800)", lineHeight: 1.55, marginBottom: 2 }}>{ev.text}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{ev.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING */}
        {matterTab === "billing" && (() => {
          const [invoiceAction, setInvoiceAction] = useState(null); // loading state per invoice
          const sendInvoice = async (invoice) => {
            setInvoiceAction(invoice.id + "_send");
            try {
              const token = localStorage.getItem("cb_token");
              const res = await fetch(`https://api.counselbridge.me/api/invoices/${invoice.id}/send`, {
                method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }
              });
              const data = await res.json();
              if (res.ok) {
                setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, status: "SENT" } : i));
              } else { alert(data?.error || "Failed to send invoice"); }
            } catch(e) { console.error(e); }
            setInvoiceAction(null);
          };
          const remindInvoice = async (invoice) => {
            setInvoiceAction(invoice.id + "_remind");
            try {
              const token = localStorage.getItem("cb_token");
              await fetch(`https://api.counselbridge.me/api/invoices/${invoice.id}/remind`, {
                method: "POST", headers: { Authorization: "Bearer " + token }
              });
            } catch(e) { console.error(e); }
            setInvoiceAction(null);
          };
          const voidInvoice = async (invoice) => {
            if (!window.confirm(`Void invoice ${invoice.number}? This cannot be undone.`)) return;
            setInvoiceAction(invoice.id + "_void");
            try {
              const token = localStorage.getItem("cb_token");
              const res = await fetch(`https://api.counselbridge.me/api/invoices/${invoice.id}/void`, {
                method: "POST", headers: { Authorization: "Bearer " + token }
              });
              if (res.ok) setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, status: "VOID" } : i));
            } catch(e) { console.error(e); }
            setInvoiceAction(null);
          };
          return (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)" }}>Invoices & Payments</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowInvoiceModal(true)}>
                <Icon name="plus" size={13} />New Invoice
              </button>
            </div>
            {inv.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-400)", fontSize: 14 }}>
                <Icon name="dollar" size={32} color="var(--gray-300)" />
                <p style={{ marginTop: 10 }}>No invoices yet for this matter.</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {inv.map(invoice => {
                const statusNorm = (invoice.status || "").toLowerCase();
                const isPaid = statusNorm === "paid";
                const isDraft = statusNorm === "draft";
                const isSent = statusNorm === "sent";
                const isOverdue = statusNorm === "overdue";
                const isVoid = statusNorm === "void";
                const amountFormatted = ((invoice.amountCents ? invoice.amountCents / 100 : invoice.amount) || 0)
                  .toLocaleString("en-US", { style: "currency", currency: "USD" });
                const statusColor = isPaid ? "var(--green)" : isOverdue ? "var(--red)" : isVoid ? "var(--gray-400)" : "var(--blue)";
                const statusBg = isPaid ? "var(--green-pale)" : isOverdue ? "var(--red-pale)" : isVoid ? "var(--gray-100)" : "var(--blue-pale)";
                return (
                  <div key={invoice.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, background: statusBg, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="dollar" size={18} color={statusColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-800)", marginBottom: 2 }}>
                        {invoice.description || invoice.desc}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>
                        {invoice.number}
                        {invoice.dueDate && ` · Due ${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                        {invoice.paidAt && ` · Paid ${new Date(invoice.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginRight: 8 }}>{amountFormatted}</div>
                    <span className={`badge ${isPaid ? "badge-green" : isOverdue ? "badge-red" : isVoid ? "badge-gray" : isDraft ? "badge-amber" : "badge-blue"}`}>
                      {invoice.status}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isDraft && (
                        <button className="btn btn-primary btn-sm" disabled={invoiceAction === invoice.id + "_send"} onClick={() => sendInvoice(invoice)}>
                          <Icon name="send" size={13} />{invoiceAction === invoice.id + "_send" ? "Sending…" : "Send"}
                        </button>
                      )}
                      {(isSent || isOverdue) && (
                        <button className="btn btn-secondary btn-sm" disabled={invoiceAction === invoice.id + "_remind"} onClick={() => remindInvoice(invoice)}>
                          <Icon name="send" size={13} />{invoiceAction === invoice.id + "_remind" ? "Sending…" : "Remind"}
                        </button>
                      )}
                      {(isSent || isOverdue) && (
                        <button className="btn btn-ghost btn-sm" title="Pay now" onClick={() => setPayingInvoice({ ...invoice, amount: (invoice.amountCents / 100), desc: invoice.description })}>
                          Pay
                        </button>
                      )}
                      {!isPaid && !isVoid && (
                        <button className="btn btn-danger btn-sm" disabled={invoiceAction === invoice.id + "_void"} onClick={() => voidInvoice(invoice)}>
                          {invoiceAction === invoice.id + "_void" ? "…" : "Void"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
};


export default MatterDetail;
