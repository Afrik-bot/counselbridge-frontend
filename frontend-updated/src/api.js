// CounselBridge API Client
// Drop this file next to CounselBridge.jsx
// Set VITE_API_URL in your .env to point at your Railway backend

const BASE = import.meta?.env?.VITE_API_URL || "https://api.counselbridge.io";

// ─── Token management ─────────────────────────────────────────────────────────
let _accessToken = localStorage.getItem("cb_access_token") || null;
let _refreshToken = localStorage.getItem("cb_refresh_token") || null;

function setTokens(access, refresh) {
  _accessToken = access;
  _refreshToken = refresh;
  if (access) localStorage.setItem("cb_access_token", access);
  else localStorage.removeItem("cb_access_token");
  if (refresh) localStorage.setItem("cb_refresh_token", refresh);
  else localStorage.removeItem("cb_refresh_token");
}

function clearTokens() { setTokens(null, null); }

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
  };

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-refresh expired token
  if (res.status === 401 && _refreshToken) {
    const refreshRes = await fetch(`${BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: _refreshToken }),
    });
    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      setTokens(accessToken, _refreshToken);
      headers.Authorization = `Bearer ${accessToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
    } else {
      clearTokens();
      window.dispatchEvent(new Event("cb:logout"));
      throw new Error("Session expired. Please log in again.");
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);
  return data;
}

function post(path, body, opts = {}) {
  return api(path, { method: "POST", body: JSON.stringify(body), ...opts });
}
function patch(path, body) {
  return api(path, { method: "PATCH", body: JSON.stringify(body) });
}
function del(path) {
  return api(path, { method: "DELETE" });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const Auth = {
  async login(email, password) {
    const data = await post("/api/auth/login", { email, password });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  async register(firmName, firstName, lastName, email, password) {
    const data = await post("/api/auth/register", { firmName, firstName, lastName, email, password });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  async sendMagicLink(email) {
    return post("/api/auth/magic-link", { email });
  },
  async logout() {
    await post("/api/auth/logout", { refreshToken: _refreshToken }).catch(() => {});
    clearTokens();
  },
  async me() { return api("/api/auth/me"); },
  isLoggedIn() { return !!_accessToken; },
};

// ─── Matters ──────────────────────────────────────────────────────────────────
export const Matters = {
  list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return api(`/api/matters${q ? "?" + q : ""}`);
  },
  get(matterId) { return api(`/api/matters/${matterId}`); },
  create(data) { return post("/api/matters", data); },
  update(matterId, data) { return patch(`/api/matters/${matterId}`, data); },
  addDocRequest(matterId, data) { return post(`/api/matters/${matterId}/doc-requests`, data); },
  completeDocRequest(matterId, reqId) { return patch(`/api/matters/${matterId}/doc-requests/${reqId}/complete`); },
  timeline(matterId) { return api(`/api/matters/${matterId}/timeline`); },
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const Messages = {
  threads(matterId) { return api(`/api/messages/matters/${matterId}/threads`); },
  send(threadId, body, isInternal = false, aiLogId = null) {
    return post(`/api/messages/threads/${threadId}`, { body, isInternal, aiLogId });
  },
  markRead(messageId) { return patch(`/api/messages/${messageId}/read`, {}); },
  unreadCount() { return api("/api/messages/unread"); },
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const Documents = {
  list(matterId) { return api(`/api/documents/matters/${matterId}`); },
  async upload(matterId, files, accessLevel = "INTERNAL", docRequestId = null) {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("accessLevel", accessLevel);
    if (docRequestId) form.append("docRequestId", docRequestId);
    const res = await fetch(`${BASE}/api/documents/matters/${matterId}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${_accessToken}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },
  downloadUrl(documentId) { return api(`/api/documents/${documentId}/download`); },
  updateAccess(documentId, accessLevel) { return patch(`/api/documents/${documentId}`, { accessLevel }); },
  delete(documentId) { return del(`/api/documents/${documentId}`); },
};

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const Invoices = {
  list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return api(`/api/invoices${q ? "?" + q : ""}`);
  },
  clientInvoices() { return api("/api/invoices/client"); },
  create(data) { return post("/api/invoices", data); },
  send(invoiceId) { return post(`/api/invoices/${invoiceId}/send`, {}); },
  pay(invoiceId, paymentMethodId) { return post(`/api/invoices/${invoiceId}/pay`, { paymentMethodId }); },
  remind(invoiceId) { return post(`/api/invoices/${invoiceId}/remind`, {}); },
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const AI = {
  draftMessage(matterId, context = "") { return post("/api/ai/draft-message", { matterId, context }); },
  caseUpdate(matterId, updateDetails) { return post("/api/ai/case-update", { matterId, updateDetails }); },
  approve(aiLogId) { return post(`/api/ai/approve/${aiLogId}`, {}); },
  reject(aiLogId) { return post(`/api/ai/reject/${aiLogId}`, {}); },
  queue() { return api("/api/ai/queue"); },
  clientChat(message, history = []) { return post("/api/ai/client-chat", { message, history }); },
  dailyDigest() { return post("/api/ai/daily-digest", {}); },
};

// ─── Real-time (Socket.IO) ────────────────────────────────────────────────────
export function connectSocket(token) {
  // Dynamically import socket.io-client only when needed
  return import("https://cdn.socket.io/4.7.5/socket.io.esm.min.js").then(({ io }) => {
    const socket = io(BASE, {
      auth: { token },
      transports: ["websocket"],
    });
    return socket;
  });
}

export default { Auth, Matters, Messages, Documents, Invoices, AI, connectSocket };
