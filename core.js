const SUPABASE_URL = 'https://zgcrybyxcjpqgmujnxwr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_otiaUyx6nDZ2dTeLLmJifQ_2lZsLUFf';
const STORAGE_KEY = 'parpilot_workspace_v1';
const app = document.querySelector('#app');
const saveStatus = document.querySelector('#saveStatus');
const recoveryButton = document.querySelector('#recoveryButton');
const resetButton = document.querySelector('#resetButton');
const toastEl = document.querySelector('#toast');

const steps = [
  { key: 'dream', label: 'Your dream' },
  { key: 'market', label: 'Market' },
  { key: 'format', label: 'Format' },
  { key: 'money', label: 'Money' },
  { key: 'menu', label: 'Menu' },
  { key: 'launch', label: 'Launch' },
  { key: 'venture', label: 'Venture Room' }
];

let state = {
  id: null,
  token: null,
  workspace: null,
  tasks: [],
  payload: defaultPayload(),
  view: 'home',
  saving: false,
  saveTimer: null
};

function defaultPayload() {
  return {
    dream: '', conceptName: '', cuisine: '', guest: '', founderRole: 'owner-operator', experience: 'first-time',
    city: '', region: 'WI', localNeed: '', competitionNotes: '',
    preferredFormat: '', availableCapital: 50000, monthlyOwnerIncome: 5000, avgTicket: 22, foodCostPct: 30, monthlyFixedCosts: 18000,
    menuItems: [], targetMonth: '', weeklyHours: 45, successDefinition: '',
    candidates: []
  };
}

async function rpc(name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function setSaveStatus(text) { saveStatus.textContent = text; }

function credentialsFromHash() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  const id = hash.get('w');
  const token = hash.get('t');
  if (id && token) return { id, token };
  return null;
}

function storeCredentials(id, token) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, token }));
  history.replaceState(null, '', location.pathname);
}

function readCredentials() {
  const shared = credentialsFromHash();
  if (shared) {
    storeCredentials(shared.id, shared.token);
    return shared;
  }
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

async function loadWorkspace(credentials) {
  setSaveStatus('Loading secure workspace…');
  const data = await rpc('pp_get_workspace', { p_id: credentials.id, p_token: credentials.token });
  if (!data?.workspace) throw new Error('This private workspace link is invalid or no longer available.');
  state.id = credentials.id;
  state.token = credentials.token;
  state.workspace = data.workspace;
  state.tasks = data.tasks || [];
  state.payload = { ...defaultPayload(), ...(data.workspace.payload || {}) };
  state.view = data.workspace.stage === 'venture' ? 'venture' : (data.workspace.stage || 'dream');
  setSaveStatus(`Saved ${new Date(data.workspace.updated_at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`);
  toggleWorkspaceActions(true);
  render();
}

function toggleWorkspaceActions(visible) {
  recoveryButton.classList.toggle('hidden', !visible);
  resetButton.classList.toggle('hidden', !visible);
}

async function createWorkspace(form) {
  const founderName = form.founderName.value.trim();
  const email = form.email.value.trim();
  const dream = form.dream.value.trim();
  if (!founderName || !dream) return toast('Tell us your name and the restaurant dream first.');
  const token = randomToken();
  setSaveStatus('Creating private workspace…');
  const id = await rpc('pp_create_workspace', { p_token: token, p_email: email, p_founder_name: founderName });
  storeCredentials(id, token);
  state.id = id; state.token = token;
  state.payload = { ...defaultPayload(), dream, conceptName: form.conceptName.value.trim() };
  await rpc('pp_save_workspace', { p_id: id, p_token: token, p_payload: state.payload, p_stage: 'dream', p_progress: 10 });
  await loadWorkspace({ id, token });
  state.view = 'dream';
  render();
  toast('Your private Venture Room is live.');
}

function calculateProgress(payload) {
  const required = ['dream','conceptName','cuisine','guest','city','preferredFormat','availableCapital','monthlyOwnerIncome','avgTicket','monthlyFixedCosts','targetMonth','successDefinition'];
  const completed = required.filter(key => String(payload[key] ?? '').trim() && Number(payload[key] ?? 1) !== 0).length;
  const menuBonus = payload.menuItems?.filter(item => item.name).length >= 3 ? 1 : 0;
  return Math.min(100, Math.round(((completed + menuBonus) / (required.length + 1)) * 100));
}

function currentStage() {
  return state.view === 'home' ? 'dream' : state.view;
}

function queueSave({ immediate = false } = {}) {
  if (!state.id) return;
  setSaveStatus('Unsaved changes');
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(saveWorkspace, immediate ? 0 : 650);
}

async function saveWorkspace() {
  if (!state.id || state.saving) return;
  state.saving = true;
  setSaveStatus('Saving to Supabase…');
  try {
    const progress = calculateProgress(state.payload);
    const ok = await rpc('pp_save_workspace', { p_id: state.id, p_token: state.token, p_payload: state.payload, p_stage: currentStage(), p_progress: progress });
    if (!ok) throw new Error('Workspace access was rejected.');
    if (state.workspace) {
      state.workspace.payload = state.payload;
      state.workspace.progress = progress;
      state.workspace.stage = currentStage();
      state.workspace.updated_at = new Date().toISOString();
    }
    setSaveStatus(`Saved ${new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`);
  } catch (error) {
    console.error(error);
    setSaveStatus('Save failed');
    toast('Could not save. Check your connection and try again.');
  } finally { state.saving = false; }
}

function formatRecommendation(payload) {
  const capital = Number(payload.availableCapital) || 0;
  const experience = payload.experience;
  if (capital < 45000) return { key: 'pop-up', name: 'Pop-up or market stall', why: 'The lowest-risk way to prove demand, pricing, and menu execution before taking on fixed occupancy costs.', estimate: 18000 };
  if (capital < 90000) return { key: 'food-truck', name: 'Food truck or mobile kitchen', why: 'Your capital can support a focused mobile concept while keeping the break-even target below most storefront models.', estimate: 65000 };
  if (capital < 180000 || experience === 'first-time') return { key: 'shared-kitchen', name: 'Shared kitchen + pickup/catering', why: 'This protects cash while you establish repeat demand, catering revenue, and operating systems.', estimate: 95000 };
  return { key: 'second-gen', name: 'Second-generation restaurant space', why: 'Your capital and readiness can support a physical location, but a previously equipped restaurant reduces buildout risk.', estimate: 240000 };
}

function financeModel(payload) {
  const ticket = Math.max(1, Number(payload.avgTicket) || 0);
  const foodCost = Math.min(.75, Math.max(.05, (Number(payload.foodCostPct) || 0) / 100));
  const fixed = Math.max(0, Number(payload.monthlyFixedCosts) || 0);
  const owner = Math.max(0, Number(payload.monthlyOwnerIncome) || 0);
  const contribution = 1 - foodCost;
  const monthlySales = (fixed + owner) / Math.max(.1, contribution);
  const monthlyTransactions = monthlySales / ticket;
  const dailyTransactions = monthlyTransactions / 30;
  const recommended = formatRecommendation(payload);
  const gap = Math.max(0, recommended.estimate - (Number(payload.availableCapital) || 0));
  return { ticket, foodCost, fixed, owner, contribution, monthlySales, monthlyTransactions, dailyTransactions, recommended, gap };
}
