function renderLaunch() {
  dashboardWrap({ head: pageHead('Turn intention into an opening sequence.', 'ParPilot keeps the launch plan tied to the life you want, not just the restaurant you can technically open.'), body: `
    <div class="panel"><div class="form-grid">
      ${field('Target opening month','targetMonth','','month')}
      ${field('Maximum weekly owner hours','weeklyHours','45','number')}
      ${textareaField('What does success look like after year one?','successDefinition','Revenue matters, but include family time, community impact, team stability, or freedom.')}
    </div></div>
    <div class="panel"><h3>Opening workstreams</h3><p class="panel-sub">These tasks are stored separately in Supabase and can be completed independently.</p><div class="task-list">${taskList()}</div></div>
    ${nextButton('venture','Open my Venture Room')}` });
  bindTasks();
}

function taskList() {
  return state.tasks.map(task => `<label class="task ${task.done ? 'done':''}"><input type="checkbox" data-task="${task.id}" ${task.done?'checked':''}/><div><span class="task-category">${escapeHtml(task.category)}</span><br><span>${escapeHtml(task.title)}</span></div></label>`).join('');
}
function bindTasks() {
  document.querySelectorAll('[data-task]').forEach(input => input.onchange = async () => {
    const task = state.tasks.find(item => item.id === input.dataset.task);
    if (!task) return;
    task.done = input.checked;
    input.closest('.task').classList.toggle('done', task.done);
    try { await rpc('pp_set_task',{p_id:state.id,p_token:state.token,p_task_id:task.id,p_done:task.done}); setSaveStatus('Task saved'); }
    catch { task.done=!task.done; input.checked=task.done; toast('Task could not be saved.'); }
  });
}

function renderVenture() {
  const model = financeModel(state.payload);
  const completedTasks = state.tasks.filter(t=>t.done).length;
  const menu = (state.payload.menuItems||[]).filter(item=>item.name);
  state.view='venture'; queueSave();
  dashboardWrap({ head: '', body: `
    <div class="venture-hero"><span class="eyebrow">Your living Venture Room</span><h2>${escapeHtml(state.payload.conceptName || 'Your restaurant')}</h2><p>${escapeHtml(state.payload.dream || 'Complete the founder vision to define the venture.')}</p>
      <div class="badges"><span class="badge">${escapeHtml(state.payload.city || 'Market not selected')}${state.payload.region ? `, ${escapeHtml(state.payload.region)}`:''}</span><span class="badge">${escapeHtml(model.recommended.name)}</span><span class="badge">${completedTasks}/${state.tasks.length} launch tasks complete</span></div>
    </div>
    <div class="grid-3">
      <div class="metric"><span>Required monthly sales</span><strong>${money(model.monthlySales)}</strong><small>Current contribution model</small></div>
      <div class="metric"><span>Daily transactions</span><strong>${Math.ceil(model.dailyTransactions)}</strong><small>At ${money(model.ticket)} average check</small></div>
      <div class="metric"><span>Capital gap</span><strong>${money(model.gap)}</strong><small>For recommended format</small></div>
    </div>
    <div class="grid-2" style="margin-top:18px">
      <div class="panel"><h3>ParPilot launch decision</h3><p class="panel-sub">Based on current capital and experience.</p><div class="recommendation"><strong>${escapeHtml(model.recommended.name)}</strong><br>${escapeHtml(model.recommended.why)}</div></div>
      <div class="panel"><h3>Founder operating standard</h3><p class="panel-sub">The business should support the life and impact you described.</p><p>${escapeHtml(state.payload.successDefinition || 'Define your year-one success standard in Launch planning.')}</p></div>
    </div>
    <div class="grid-2">
      <div class="panel"><h3>Opening menu</h3><p class="panel-sub">${menu.length} items currently defined.</p>${menu.length ? `<div class="mini-list">${menu.map(item=>`<div class="mini-item"><span class="mini-icon">•</span><div><strong>${escapeHtml(item.name)}</strong><span>${money(item.price)}</span></div></div>`).join('')}</div>`:'<div class="empty">Add menu items to see them here.</div>'}</div>
      <div class="panel"><h3>Next actions</h3><p class="panel-sub">Stored in your private workspace.</p><div class="task-list">${taskList()}</div></div>
    </div>
    <div class="panel"><h3>Private access and continuity</h3><p class="panel-sub">Use the recovery link to open this exact Venture Room on another device. Anyone with the link can access it, so treat it like a password.</p><button class="button button-secondary" id="copyRecoveryInline">Copy private recovery link</button></div>
  ` });
  bindTasks();
  document.querySelector('#copyRecoveryInline').onclick = copyRecoveryLink;
}

function field(label,key,placeholder='',type='text') { return `<div class="field"><label>${label}</label><input class="input" data-field="${key}" type="${type}" value="${escapeHtml(state.payload[key] ?? '')}" placeholder="${escapeHtml(placeholder)}" /></div>`; }
function textareaField(label,key,placeholder='') { return `<div class="field full"><label>${label}</label><textarea class="textarea" data-field="${key}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(state.payload[key] ?? '')}</textarea></div>`; }
function selectField(label,key,options) { return `<div class="field"><label>${label}</label><select class="select" data-field="${key}">${options.map(([value,text])=>`<option value="${value}" ${state.payload[key]===value?'selected':''}>${escapeHtml(text)}</option>`).join('')}</select></div>`; }
function nextButton(view,label) { return `<div class="form-actions"><span></span><button class="button button-primary" data-next="${view}">${label}</button></div>`; }

function render() {
  if (!state.id) return renderHome();
  toggleWorkspaceActions(true);
  const renderers = { dream:renderDream, market:renderMarket, format:renderFormat, money:renderMoney, menu:renderMenu, launch:renderLaunch, venture:renderVenture };
  (renderers[state.view] || renderDream)();
  document.querySelectorAll('[data-next]').forEach(button => button.onclick = () => navigate(button.dataset.next));
}

async function copyRecoveryLink() {
  if (!state.id) return;
  const link = `${location.origin}${location.pathname}#w=${encodeURIComponent(state.id)}&t=${encodeURIComponent(state.token)}`;
  try { await navigator.clipboard.writeText(link); toast('Private recovery link copied. Treat it like a password.'); }
  catch { prompt('Copy this private recovery link:', link); }
}

function handleFatal(error) {
  console.error(error);
  setSaveStatus('Connection error');
  app.innerHTML = `<section class="onboarding-wrap"><div class="onboarding-card"><span class="step-kicker">Could not open ParPilot</span><h2>Something failed.</h2><p>${escapeHtml(error.message)}</p><button class="button button-primary" id="retryButton">Try again</button></div></section>`;
  document.querySelector('#retryButton').onclick = () => location.reload();
}

recoveryButton.onclick = copyRecoveryLink;
resetButton.onclick = () => {
  if (!confirm('Start a new restaurant project on this device? Keep your recovery link if you want to return to this one.')) return;
  localStorage.removeItem(STORAGE_KEY); location.hash=''; location.reload();
};

(async function init(){
  const credentials = readCredentials();
  if (!credentials?.id || !credentials?.token) return renderHome();
  app.innerHTML = '<div class="loading"><div><div class="spinner"></div>Opening your private Venture Room…</div></div>';
  try { await loadWorkspace(credentials); }
  catch (error) { localStorage.removeItem(STORAGE_KEY); handleFatal(error); }
})();
