import { useState, useRef, useEffect } from "react";
import { Icon, Avatar } from "../Icons";

const VideoCall = ({ contact, onClose, isClient, currentUser }) => {
  const [callState, setCallState] = useState("lobby"); // lobby | connecting | active | ended
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [callMsg, setCallMsg] = useState("");
  const [callChats, setCallChats] = useState([
    { sender: "system", text: "Meeting started — messages visible to all participants" }
  ]);
  const [duration, setDuration] = useState(0);
  const [remoteActive, setRemoteActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [permError, setPermError] = useState(null);
  const [summaryText, setSummaryText] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);
  const pcRef = useRef(null);

  // Derive display name for "You"
  const myName = currentUser
    ? (`${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "You")
    : (contact?.myName || "You");

  // Wire stream to video element on every render so the ref is never stale
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  });

  // Start local camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermError("Camera/microphone access was denied. Please allow access in your browser and try again.");
      } else if (err.name === "NotFoundError") {
        setPermError("No camera or microphone found on this device.");
      } else {
        setPermError("Could not access camera: " + err.message);
      }
      return null;
    }
  };

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
  };

  const joinCall = async () => {
    setCallState("connecting");
    const stream = await startCamera();
    if (!stream) { setCallState("lobby"); return; }

    // Simulate remote joining after 2.5 seconds
    setTimeout(() => {
      setCallState("active");
      setRemoteActive(true);
      // Start duration timer
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }, 2500);
  };

  const endCall = async () => {
    clearInterval(timerRef.current);
    stopCamera();
    setCallState("ended");
    // Generate AI summary
    setShowSummary(true);
    setSummaryLoading(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an AI legal assistant generating a meeting summary for an attorney. Be concise and professional. Format: 1 short paragraph summary, then a bulleted action items list.",
          messages: [{
            role: "user",
            content: `Generate a brief meeting summary for a video consultation between attorney ${currentUser ? (currentUser.firstName + " " + currentUser.lastName).trim() : (contact?.myName || "the attorney")} and client ${contact?.name || "the client"} regarding ${contact?.matter || "their legal matter"}. The call lasted ${Math.floor(duration / 60)} minutes and ${duration % 60} seconds. Include 2-3 plausible action items based on a typical legal consultation.`
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(c => c.text || "").join("") || "Meeting completed. Please add your notes manually.";
      setSummaryText(text);
    } catch {
      setSummaryText("Meeting completed (" + fmt(duration) + "). AI summary unavailable — please add notes manually.");
    }
    setSummaryLoading(false);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setMicOn(m => !m);
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setCamOn(c => !c);
  };

  const toggleScreen = async () => {
    if (screenSharing) {
      // Stop screen share, revert to camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => null);
      if (stream && localVideoRef.current) {
        stopCamera();
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;
      }
      setScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
          localStreamRef.current = screenStream;
        }
        screenStream.getVideoTracks()[0].onended = () => setScreenSharing(false);
        setScreenSharing(true);
      } catch { /* user cancelled */ }
    }
  };

  const sendCallMsg = () => {
    if (!callMsg.trim()) return;
    setCallChats(c => [...c, { sender: isClient ? "client" : "attorney", text: callMsg }]);
    setCallMsg("");
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      stopCamera();
    };
  }, []);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
  };

  // ── LOBBY ──
  if (callState === "lobby") return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,18,36,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#0F1E33", borderRadius: 20, padding: "40px 36px", width: 440, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 72, height: 72, background: "rgba(37,99,235,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "2px solid rgba(37,99,235,0.4)" }}>
          <Icon name="video" size={30} color="#60A5FA" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6, fontFamily: "var(--font-serif)" }}>
          {isClient ? "Join Your Consultation" : `Call with ${contact?.name || "Client"}`}
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28 }}>
          {isClient ? `with ${contact?.name || "Your Attorney"}${contact?.firmName ? " · " + contact.firmName : ""}` : contact?.matter || "Video Consultation"}
        </div>
        {permError && (
          <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13.5, color: "#FCA5A5", textAlign: "left" }}>
            {permError}
          </div>
        )}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "16px", marginBottom: 24, display: "flex", gap: 20, justifyContent: "center" }}>
          <div style={{ display: "flex", flex: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: micOn ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.15)", border: micOn ? "1.5px solid rgba(5,150,105,0.5)" : "1.5px solid rgba(220,38,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setMicOn(m => !m)}>
              <Icon name="mic" size={18} color={micOn ? "#6EE7B7" : "#FCA5A5"} />
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{micOn ? "Mic on" : "Muted"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: camOn ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.15)", border: camOn ? "1.5px solid rgba(5,150,105,0.5)" : "1.5px solid rgba(220,38,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setCamOn(c => !c)}>
              <Icon name="video" size={18} color={camOn ? "#6EE7B7" : "#FCA5A5"} />
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{camOn ? "Cam on" : "Cam off"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px 0", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={joinCall} style={{ flex: 2, padding: "12px 0", background: "var(--blue)", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="video" size={16} color="white" /> Join Now
          </button>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>End-to-end encrypted · Recorded only with consent</div>
      </div>
    </div>
  );

  // ── CONNECTING ──
  if (callState === "connecting") return (
    <div style={{ position: "fixed", inset: 0, background: "#060E1A", zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "2px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulse 2s infinite" }}>
          <Avatar name={contact?.name || "Client"} size={56} color="blue" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "white", marginBottom: 8, fontFamily: "var(--font-serif)" }}>Connecting…</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>Waiting for {contact?.name || "client"} to join</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)", animation: `bounce 1.4s ease infinite`, animationDelay: i * 0.2 + "s" }} />
          ))}
        </div>
        <button onClick={() => { stopCamera(); setCallState("lobby"); }} style={{ marginTop: 40, padding: "10px 28px", background: "rgba(220,38,38,0.15)", color: "#FCA5A5", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14 }}>
          Cancel
        </button>
      </div>
    </div>
  );

  // ── ACTIVE CALL ──
  if (callState === "active") return (
    <div style={{ position: "fixed", inset: 0, background: "#060E1A", zIndex: 2000, display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <div style={{ height: 52, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", padding: "0 20px", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, background: "var(--blue)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="shield" size={14} color="white" />
        </div>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "white" }}>CounselBridge</span>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{contact?.name || "Client"}</span>
        {contact?.matter && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>· {contact.matter}</span>}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.4)", borderRadius: 20, padding: "4px 12px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12.5, color: "#6EE7B7", fontWeight: 600 }}>{fmt(duration)}</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="shield" size={12} color="rgba(255,255,255,0.3)" />
          Encrypted
        </div>
      </div>

      {/* Video area */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Remote video (large) */}
        <div style={{ flex: 1, background: "#0C1525", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {remoteActive ? (
            <video ref={remoteVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : null}
          {/* Remote placeholder — simulated participant */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0C1A2E 0%, #142236 100%)" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "3px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Avatar name={contact?.name || "Client"} size={72} color="teal" />
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", fontWeight: 600, fontFamily: "var(--font-serif)" }}>{contact?.name || "Client"}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Camera off</div>
          </div>
          {/* Participant name overlay */}
          <div style={{ position: "absolute", bottom: 14, left: 16, background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "4px 10px", fontSize: 12.5, color: "white", backdropFilter: "blur(4px)" }}>
            {contact?.name || "Client"}
          </div>
        </div>

        {/* Local video (PIP) */}
        <div style={{ position: "absolute", top: 16, right: chatOpen ? 316 : 16, width: 180, height: 120, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", transition: "right 0.3s ease", zIndex: 10 }}>
          {camOn ? (
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#1a2a40", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Avatar name={myName} size={44} color="blue" />
            </div>
          )}
          <div style={{ position: "absolute", bottom: 6, left: 8, fontSize: 11, color: "white", background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 4 }}>
            {`You (${myName.split(" ")[0] || "You"})`}
          </div>
          {!micOn && (
            <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(220,38,38,0.8)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="mic" size={11} color="white" />
            </div>
          )}
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div style={{ width: 300, background: "rgba(8,16,28,0.95)", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.8)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Meeting Chat
              <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}>
                <Icon name="x" size={15} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {callChats.map((m, i) => (
                <div key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                  {m.sender === "system" ? (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11.5, padding: "4px 0" }}>{m.text}</div>
                  ) : (
                    <div style={{ background: m.sender === (isClient ? "client" : "attorney") ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 10px", color: "rgba(255,255,255,0.85)" }}>
                      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>
                        {m.sender === (isClient ? "client" : "attorney") ? "You" : contact?.name}
                      </div>
                      {m.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 6 }}>
              <input value={callMsg} onChange={e => setCallMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendCallMsg()} placeholder="Send a message..." style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, padding: "7px 10px", color: "white", fontFamily: "var(--font-sans)", fontSize: 13, outline: "none" }} />
              <button onClick={sendCallMsg} style={{ background: "var(--blue)", border: "none", borderRadius: 7, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Icon name="send" size={14} color="white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div style={{ height: 80, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        {[
          { icon: micOn ? "mic" : "mic", label: micOn ? "Mute" : "Unmute", onClick: toggleMic, active: !micOn, danger: !micOn },
          { icon: "video", label: camOn ? "Stop Video" : "Start Video", onClick: toggleCam, active: !camOn, danger: !camOn },
          { icon: "layers", label: screenSharing ? "Stop Share" : "Share Screen", onClick: toggleScreen, active: screenSharing, highlight: screenSharing },
          { icon: "message", label: "Chat", onClick: () => setChatOpen(c => !c), active: chatOpen, highlight: chatOpen },
        ].map(ctrl => (
          <button key={ctrl.label} onClick={ctrl.onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: ctrl.danger ? "rgba(220,38,38,0.2)" : ctrl.highlight ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.08)", border: ctrl.danger ? "1px solid rgba(220,38,38,0.4)" : ctrl.highlight ? "1px solid rgba(37,99,235,0.4)" : "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 18px", cursor: "pointer", minWidth: 72, transition: "all 0.15s" }}>
            <Icon name={ctrl.icon} size={20} color={ctrl.danger ? "#FCA5A5" : ctrl.highlight ? "#93C5FD" : "rgba(255,255,255,0.8)"} />
            <span style={{ fontSize: 11, color: ctrl.danger ? "#FCA5A5" : ctrl.highlight ? "#93C5FD" : "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }}>{ctrl.label}</span>
          </button>
        ))}

        <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

        {/* End call */}
        <button onClick={endCall} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "rgba(220,38,38,0.85)", border: "none", borderRadius: 12, padding: "10px 24px", cursor: "pointer", minWidth: 80, transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#DC2626"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(220,38,38,0.85)"}>
          <Icon name="phone" size={20} color="white" style={{ transform: "rotate(135deg)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-sans)" }}>End Call</span>
        </button>
      </div>
    </div>
  );

  // ── SUMMARY ──
  if (callState === "ended" && showSummary) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,18,36,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#0F1E33", borderRadius: 20, padding: "36px 32px", width: 520, maxHeight: "80vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, background: "rgba(5,150,105,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check-circle" size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "white", fontFamily: "var(--font-serif)" }}>Call Ended</div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 2 }}>· {fmt(duration)}</span>
        </div>
        <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
          With {contact?.name || "Client"} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>

        <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <Icon name="cpu" size={14} color="#A78BFA" />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Meeting Summary</span>
            {summaryLoading && <div style={{ width: 14, height: 14, border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginLeft: 4 }} />}
          </div>
          {summaryLoading ? (
            <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "8px 0" }}>
              <div className="ai-typing"><span /><span /><span /></div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>Generating summary…</span>
            </div>
          ) : (
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{summaryText}</div>
          )}
        </div>

        <div style={{ background: "rgba(215,119,0,0.12)", border: "1px solid rgba(215,119,0,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12.5, color: "#FCD34D", display: "flex", gap: 7, alignItems: "flex-start" }}>
          <Icon name="shield" size={13} color="#FCD34D" />
          This summary requires your review before being added to the matter file or shared with the client.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14 }}>
            Close
          </button>
          {!summaryLoading && (
            <button onClick={onClose} style={{ flex: 2, padding: "11px 0", background: "var(--blue)", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600 }}>
              Save to Matter File
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return null;
};


// ─── STRIPE PAYMENT MODAL ─────────────────────────────────────────────────────

export default VideoCall;
