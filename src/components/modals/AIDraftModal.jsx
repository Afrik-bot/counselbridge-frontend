import { useState } from "react";
import { Icon } from "./Icons";

const AIDraftModal = ({ draft, onApprove, onEdit, onReject, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft.preview);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,34,64,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="card fade-in" style={{ width: 560, maxHeight: "80vh", overflow: "auto", padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--purple-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="cpu" size={18} color="var(--purple)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>AI Review Required</div>
              <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{draft.agent} · {draft.matterTitle}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="ai-card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span className="ai-badge"><Icon name="cpu" size={11} color="var(--purple)" />AI Generated</span>
            <span style={{ fontSize: 12, color: "var(--gray-500)" }}>· {draft.type} · Review before sending</span>
          </div>
          {editing ? (
            <textarea className="input textarea" value={text} onChange={e => setText(e.target.value)} style={{ minHeight: 120, fontSize: 14, lineHeight: 1.6 }} />
          ) : (
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--gray-700)" }}>{text}</p>
          )}
        </div>
        <div style={{ background: "var(--amber-pale)", border: "1px solid #FDE68A", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 18, fontSize: 12.5, color: "#92400E", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon name="alert-circle" size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          This AI-generated content will only be sent after your explicit approval. You are responsible for the final content as the attorney of record.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-danger btn-sm" onClick={onReject}>Reject</button>
          {editing
            ? <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Preview</button>
            : <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><Icon name="edit" size={13} />Edit</button>
          }
          <button className="btn btn-primary btn-sm" onClick={() => onApprove(text)}><Icon name="check" size={13} />Approve & Send</button>
        </div>
      </div>
    </div>
  );
};


// ─── VIDEO CALL COMPONENT ─────────────────────────────────────────────────────

export default AIDraftModal;
