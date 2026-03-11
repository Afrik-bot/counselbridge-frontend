// ─── CounselBridge API Integration ────────────────────────────────────────────
// This file wires the frontend to the real backend at api.counselbridge.me

const BASE = import.meta?.env?.VITE_API_URL || "https://api.counselbridge.me";

// ─── Token storage ────────────────────────────────────────────────────────────
export const TokenStore = {
  get: () => ({ access: localStorage.getItem("cb_token"), refresh: localStorage.getItem("cb_refresh") }),
  set: (access, refresh) => { localStorage.setItem("cb_token", access); if (refresh) localStorage.setItem("cb_refresh", refresh); },
  clear: () => { localStorage.removeItem("cb_token"); localStorage.removeItem("cb_refresh"); localStorage.removeItem("cb_user"); localStorage.removeItem("cb_firm"); },
  getUser: () => { try { return JSON.parse(localStorage.getItem("cb_user")); } catch { return null; } },
  setUser: (u) => localStorage.setItem("cb_user", JSON.stringify(u)),
  getFirm: () => { try { return JSON.parse(localStorage.getItem("cb_firm")); } catch { return null; } },
  setFirm: (f) => localStorage.setItem("cb_firm", JSON.stringify(f)),
};

// ─── Core fetch ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const { access, refresh } = TokenStore.get();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  };

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-refresh
  if (res.status === 401 && refresh) {
    const r = await fetch(`${BASE}/api/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (r.ok) {
      const { accessToken } = await r.json();
      TokenStore.set(accessToken, null);
      headers.Authorization = `Bearer ${accessToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
    } else {
      TokenStore.clear();
      window.location.reload();
      return null;
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

const post = (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) });
const patch = (path, body) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
const del = (path) => apiFetch(path, { method: "DELETE" });

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const AuthAPI = {
  async login(email, password) {
    const data = await post("/api/auth/login", { email, password });
    TokenStore.set(data.accessToken, data.refreshToken);
    TokenStore.setUser(data.user);
    TokenStore.setFirm(data.firm);
    return data;
  },
  async register(firmName, firstName, lastName, email, password) {
    const data = await post("/api/auth/register", { firmName, firstName, lastName, email, password });
    TokenStore.set(data.accessToken, data.refreshToken);
    TokenStore.setUser(data.user);
    TokenStore.setFirm(data.firm);
    return data;
  },
  async magicLink(email) { return post("/api/auth/magic-link", { email }); },
  async logout() {
    const { refresh } = TokenStore.get();
    await post("/api/auth/logout", { refreshToken: refresh }).catch(() => {});
    TokenStore.clear();
  },
  isLoggedIn: () => !!TokenStore.get().access,
};

// ─── Matters API ──────────────────────────────────────────────────────────────
export const MattersAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/matters${q ? "?" + q : ""}`);
  },
  get: (id) => apiFetch(`/api/matters/${id}`),
  create: (data) => post("/api/matters", data),
  update: (id, data) => patch(`/api/matters/${id}`, data),
};

// ─── Messages API ─────────────────────────────────────────────────────────────
export const MessagesAPI = {
  threads: (matterId) => apiFetch(`/api/messages/matters/${matterId}/threads`),
  send: (threadId, body, isInternal = false, aiLogId = null) =>
    post(`/api/messages/threads/${threadId}`, { body, isInternal, aiLogId }),
  markRead: (messageId) => patch(`/api/messages/${messageId}/read`, {}),
};

// ─── Documents API ────────────────────────────────────────────────────────────
export const DocumentsAPI = {
  list: (matterId) => apiFetch(`/api/documents/matters/${matterId}`),
  async upload(matterId, files, accessLevel = "INTERNAL") {
    const { access } = TokenStore.get();
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("accessLevel", accessLevel);
    const res = await fetch(`${BASE}/api/documents/matters/${matterId}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },
  downloadUrl: (id) => apiFetch(`/api/documents/${id}/download`),
  updateAccess: (id, accessLevel) => patch(`/api/documents/${id}`, { accessLevel }),
};

// ─── Invoices API ─────────────────────────────────────────────────────────────
export const InvoicesAPI = {
  list: () => apiFetch("/api/invoices"),
  clientList: () => apiFetch("/api/invoices/client"),
  create: (data) => post("/api/invoices", data),
  send: (id) => post(`/api/invoices/${id}/send`, {}),
  remind: (id) => post(`/api/invoices/${id}/remind`, {}),
};

// ─── AI API ───────────────────────────────────────────────────────────────────
export const AIAPI = {
  draftMessage: (matterId, context = "") => post("/api/ai/draft-message", { matterId, context }),
  caseUpdate: (matterId, details) => post("/api/ai/case-update", { matterId, updateDetails: details }),
  approve: (aiLogId) => post(`/api/ai/approve/${aiLogId}`, {}),
  reject: (aiLogId) => post(`/api/ai/reject/${aiLogId}`, {}),
  queue: () => apiFetch("/api/ai/queue"),
  clientChat: (message, history = []) => post("/api/ai/client-chat", { message, history }),
  dailyDigest: () => post("/api/ai/daily-digest", {}),
};

// ─── Data normalizers (backend → frontend format) ─────────────────────────────
export function normalizeMatter(m) {
  if (!m) return null;
  const client = m.members?.find((mb) => mb.role === "client")?.user;
  const attorney = m.members?.find((mb) => mb.role === "lead_attorney")?.user;
  return {
    id: m.id,
    ref: m.referenceCode,
    title: m.title,
    client: client ? `${client.firstName} ${client.lastName}` : "Unknown Client",
    clientEmail: client?.email || "",
    clientId: m.clientId,
    status: m.status?.toLowerCase().replace("_", "_") || "active",
    practice: m.practiceArea,
    attorney: attorney ? `${attorney.firstName} ${attorney.lastName}` : "Unknown Attorney",
    unread: 0,
    daysOpen: Math.floor((new Date() - new Date(m.openedAt)) / 86400000),
    nextDeadline: null,
    urgency: "medium",
    retainer: m.customFields?.retainerAmount || 0,
    paid: 0,
    nextStep: m.nextStepClient || "No updates at this time.",
    nextStepInternal: m.nextStepInternal || "",
    // Raw data
    threads: m.threads || [],
    documents: m.documents || [],
    docRequests: m.docRequests || [],
    invoices: m.invoices || [],
    events: m.events || [],
    tasks: m.tasks || [],
  };
}

export function normalizeMessages(threads, userId) {
  const messages = {};
  if (!threads) return messages;
  threads.forEach((thread) => {
    const matterId = thread.matterId;
    if (!messages[matterId]) messages[matterId] = [];
    thread.messages?.forEach((msg) => {
      messages[matterId].push({
        id: msg.id,
        threadId: thread.id,
        sender: msg.senderId === userId ? "attorney" : (msg.sender?.role === "CLIENT" ? "client" : "attorney"),
        name: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : "Unknown",
        body: msg.body,
        time: new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: !!msg.readBy?.[userId],
        internal: msg.isInternal,
        aiGenerated: msg.aiGenerated,
      });
    });
  });
  return messages;
}

export function normalizeInvoices(invoices) {
  if (!invoices) return [];
  return invoices.map((inv) => ({
    id: inv.id,
    matterId: inv.matterId,
    number: inv.number,
    desc: inv.description,
    amount: inv.amountCents / 100,
    status: inv.status?.toLowerCase(),
    date: new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    due: new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
}

export function normalizeAIQueue(queue) {
  if (!queue) return [];
  return queue.map((item) => ({
    id: item.id,
    matterId: item.matterId,
    matterTitle: item.matter?.title || "Unknown Matter",
    agent: item.agentName,
    type: item.outputType?.replace(/_/g, " ") || "AI Draft",
    preview: item.output,
    generated: new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    aiLogId: item.id,
  }));
}
