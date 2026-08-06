function renderHome() {
  toggleWorkspaceActions(false);
  setSaveStatus('Secure Supabase workspace');
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Dream-to-Doors is live</span>
        <h1>Turn the restaurant in your head into a <em>real operating plan.</em></h1>
        <p>ParPilot creates a private Venture Room, saves every decision to the cloud, models your break-even point, compares launch formats, and gives you a concrete path from idea to opening day.</p>
        <div class="hero-actions"><button class="button button-primary" id="beginButton">Build my restaurant</button></div>
        <div class="proof-row">
          <div class="proof"><strong>Real persistence</strong><span>Every answer saves to Supabase.</span></div>
          <div class="proof"><strong>Real economics</strong><span>Break-even changes as you edit assumptions.</span></div>
          <div class="proof"><strong>Private by default</strong><span>Your secret recovery link controls access.</span></div>
        </div>
      </div>
      <aside class="preview-card">
        <div class="preview-header"><strong>Venture readiness</strong><span>Live model</span></div>
        <div class="score-ring"><strong>68%</strong></div>
        <div class="mini-list">
          <div class="mini-item"><span class="mini-icon">1</span><div><strong>Choose launch format</strong><span>Capital-aware recommendation</span></div></div>
          <div class="mini-item"><span class="mini-icon">2</span><div><strong>Prove unit economics</strong><span>Daily transactions required</span></div></div>
          <div class="mini-item"><span class="mini-icon">3</span><div><strong>Build opening roadmap</strong><span>Persistent tasks and milestones</span></div></div>
        </div>
      </aside>
    </section>`;
  document.querySelector('#beginButton').onclick = renderCreate;
}

function renderCreate() {
  app.innerHTML = `<section class="onboarding-wrap"><form id="createForm" class="onboarding-card">
    <span class="step-kicker">Create your private Venture Room</span>
    <h2>Start with the dream—not a spreadsheet.</h2>
    <p>This creates a real cloud workspace. No payment information and no fake sample project.</p>
    <div class="form-grid">
      <div class="field"><label for="founderName">Your name</label><input class="input" id="founderName" name="founderName" autocomplete="name" required /></div>
      <div class="field"><label for="email">Email for project reference</label><input class="input" id="email" name="email" type="email" autocomplete="email" /></div>
      <div class="field full"><label for="conceptName">Working restaurant name</label><input class="input" id="conceptName" name="conceptName" placeholder="It can change later" /></div>
      <div class="field full"><label for="dream">Describe the restaurant you want to create</label><textarea class="textarea" id="dream" name="dream" placeholder="What would it serve, who would come, and why does this matter to you?" required></textarea></div>
    </div>
    <div class="form-actions"><button type="button" class="button button-ghost" id="cancelCreate">Back</button><button class="button button-primary">Create Venture Room</button></div>
  </form></section>`;
  document.querySelector('#cancelCreate').onclick = renderHome;
  document.querySelector('#createForm').onsubmit = event => { event.preventDefault(); createWorkspace(event.currentTarget).catch(handleFatal); };
}

function navHtml() {
  const name = state.payload.conceptName || 'Untitled restaurant';
  return `<aside class="sidebar">
    <div class="project-name"><strong>${escapeHtml(name)}</strong><span>Private Venture Room</span></div>
    <nav class="nav-list">${steps.map(step => `<button class="nav-button ${state.view === step.key ? 'active' : ''}" data-view="${step.key}">${escapeHtml(step.label)}</button>`).join('')}</nav>
  </aside>`;
}

function dashboardWrap(content) {
  const progress = state.workspace?.progress ?? calculateProgress(state.payload);
  app.innerHTML = `<div class="dashboard">${navHtml()}<section class="content">
    <div class="page-head"><div>${content.head}</div><div class="progress-card"><span>Readiness</span><strong>${progress}%</strong><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></div></div>
    ${content.body}
  </section></div>`;
  document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => navigate(button.dataset.view));
  bindAutoSave();
}

function navigate(view) {
  collectCurrentForm();
  state.view = view;
  queueSave({ immediate: true });
  render();
  scrollTo({ top: 0, behavior: 'smooth' });
}

function collectCurrentForm() {
  document.querySelectorAll('[data-field]').forEach(element => {
    const key = element.dataset.field;
    if (element.type === 'number') state.payload[key] = Number(element.value || 0);
    else state.payload[key] = element.value;
  });
}

function bindAutoSave() {
  document.querySelectorAll('[data-field]').forEach(element => {
    element.addEventListener('input', () => { collectCurrentForm(); queueSave(); updateLiveCalculations(); });
    element.addEventListener('change', () => { collectCurrentForm(); queueSave(); updateLiveCalculations(); });
  });
}

function pageHead(title, text) { return `<span class="eyebrow">Dream-to-Doors</span><h2>${title}</h2><p>${text}</p>`; }
