const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8086';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body, params) {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null))
    ).toString();
    if (qs) url += `?${qs}`;
  }
  const headers = { 'Content-Type': 'application/json', ...authHeaders() };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const get = (path, params) => request('GET', path, null, params);
export const post = (path, body) => request('POST', path, body);
export const put = (path, body) => request('PUT', path, body);
export const del = (path) => request('DELETE', path);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    }).then(r => r.json());
  },
  me: () => get('/auth/me'),
};

// ─── Policies ────────────────────────────────────────────────────────────────
export const policiesApi = {
  getByNumber: (number) => get(`/policies/${number}`),
  list: () => get('/policies/'),
};

// ─── Claims ──────────────────────────────────────────────────────────────────
export const claimsApi = {
  list: (params) => get('/claims/', params),
  stats: () => get('/claims/dashboard/stats'),
  myTasks: (email) => get('/claims/dashboard/my-tasks', { email }),
  get: (claimId) => get(`/claims/${claimId}`),
  create: (data) => post('/claims/', data),
  update: (claimId, data) => put(`/claims/${claimId}`, data),
};

// ─── Sub Claims ──────────────────────────────────────────────────────────────
export const subClaimsApi = {
  byClaim: (claimId) => get(`/sub-claims/by-claim/${claimId}`),
  get: (scId) => get(`/sub-claims/${scId}`),
  create: (data) => post('/sub-claims/', data),
  update: (scId, data) => put(`/sub-claims/${scId}`, data),
  delete: (scId) => del(`/sub-claims/${scId}`),

  // Tasks
  getTasks: (scId) => get(`/sub-claims/${scId}/tasks`),
  addTask: (scId, data) => post(`/sub-claims/${scId}/tasks`, data),
  updateTask: (taskId, data) => put(`/sub-claims/tasks/${taskId}`, data),

  // Documents
  getDocuments: (scId) => get(`/sub-claims/${scId}/documents`),
  addDocument: (scId, data) => post(`/sub-claims/${scId}/documents`, data),
  deleteDocument: (docId) => del(`/sub-claims/documents/${docId}`),

  // Reserves
  getReserves: (scId) => get(`/sub-claims/${scId}/reserves`),
  addReserve: (scId, data) => post(`/sub-claims/${scId}/reserves`, data),
  approveReserve: (reserveId) => put(`/sub-claims/reserves/${reserveId}/approve`),

  // Deductibles
  getDeductibles: (scId) => get(`/sub-claims/${scId}/deductibles`),
  addDeductible: (scId, data) => post(`/sub-claims/${scId}/deductibles`, data),

  // Litigation
  getLitigation: (scId) => get(`/sub-claims/${scId}/litigation`),
  updateLitigation: (scId, data) => put(`/sub-claims/${scId}/litigation`, data),

  // SIU
  getSIU: (scId) => get(`/sub-claims/${scId}/siu`),
  updateSIU: (scId, data) => put(`/sub-claims/${scId}/siu`, data),

  // Stakeholders
  getStakeholders: (scId, section) => get(`/sub-claims/${scId}/stakeholders`, section ? { section } : {}),
  addStakeholder: (scId, data) => post(`/sub-claims/${scId}/stakeholders`, data),
  deleteStakeholder: (shId) => del(`/sub-claims/stakeholders/${shId}`),

  // Parties
  getParties: (scId) => get(`/sub-claims/${scId}/parties`),
  addParty: (scId, data) => post(`/sub-claims/${scId}/parties`, data),

  // Messages
  getMessages: (scId) => get(`/sub-claims/${scId}/messages`),
  postMessage: (scId, data) => post(`/sub-claims/${scId}/messages`, data),

  // Settlement
  createSettlement: (scId, data) => post(`/sub-claims/${scId}/settlements`, data),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (data) => post('/ai/chat', data),
  insight: (data) => post('/ai/insight', data),
  claimSummary: (data) => post('/ai/claim-summary', data),
  similarIncidents: (data) => post('/ai/similar-incidents', data),
};

// ─── Manager ─────────────────────────────────────────────────────────────────
export const managerApi = {
  dashboard: () => get('/manager/dashboard'),
  approve: (id, data) => put(`/manager/settlements/${id}/approve`, data),
  decline: (id, data) => put(`/manager/settlements/${id}/decline`, data),
};

