function renderDream() {
  dashboardWrap({ head: pageHead('Define the restaurant worth building.', 'ParPilot uses this founder thesis to keep later financial and facility decisions connected to the experience you actually want to create.'), body: `
    <div class="panel"><div class="form-grid">
      ${field('Working restaurant name','conceptName')}
      ${selectField('Your role','founderRole',[['owner-operator','Owner-operator'],['chef-owner','Chef-owner'],['business-owner','Business owner with hired operator']])}
      ${field('Cuisine or food identity','cuisine','e.g. Wisconsin comfort food, Filipino bakery')}
      ${selectField('Your restaurant experience','experience',[['first-time','First-time owner'],['manager','Managed a restaurant'],['operator','Owned or operated before']])}
      ${textareaField('The dream','dream','Describe what this restaurant should feel like and why it should exist.')}
      ${textareaField('Who is the guest?','guest','Be specific: families after youth sports, downtown office workers, late-night students…')}
    </div></div>
    ${nextButton('market','Continue to market')}` });
}

function renderMarket() {
  dashboardWrap({ head: pageHead('Choose the first market to prove.', 'This is the operating area ParPilot will use for future competition, demographic, property, and permit research.'), body: `
    <div class="panel"><div class="form-grid">
      ${field('City','city','Menasha')}
      ${field('State or region','region','WI')}
      ${textareaField('What local need do you believe exists?','localNeed','What is missing or poorly served today?')}
      ${textareaField('Competitors you already know','competitionNotes','Names, price points, strengths, or frustrations you have noticed.')}
    </div></div>
    <div class="recommendation"><strong>Evidence rule:</strong> ParPilot treats these as hypotheses—not facts. The next market-data connection will test them against live local evidence.</div>
    ${nextButton('format','Compare launch formats')}` });
}

function renderFormat() {
  const rec = formatRecommendation(state.payload);
  const formats = [
    ['pop-up','Pop-up or market stall',18000,'Fastest demand test; lowest fixed cost.'],
    ['food-truck','Food truck',65000,'Mobile demand capture with equipment and permitting needs.'],
    ['shared-kitchen','Shared kitchen + pickup',95000,'Build demand, catering, and delivery before a lease.'],
    ['second-gen','Second-generation storefront',240000,'Full guest experience with reduced construction risk.']
  ];
  dashboardWrap({ head: pageHead('Choose the safest path to opening.', 'The recommendation changes with your available capital and operating experience.'), body: `
    <div class="grid-2">${formats.map(([key,name,cost,desc]) => `<button class="format-card ${rec.key === key ? 'recommended' : ''}" data-format="${key}">
      ${rec.key === key ? '<span class="tag">ParPilot recommendation</span>' : '<span class="tag">Launch path</span>'}
      <h3>${name}</h3><p>${desc}</p><strong>${money(cost)} planning range</strong>
    </button>`).join('')}</div>
    <div class="panel" style="margin-top:18px"><h3>Why ${escapeHtml(rec.name)} currently leads</h3><p class="panel-sub">${escapeHtml(rec.why)}</p>
      <div class="form-grid">${selectField('Your preferred path','preferredFormat',formats.map(([key,name])=>[key,name]))}${field('Available capital','availableCapital','50000','number')}</div>
    </div>
    ${nextButton('money','Build the financial model')}` });
  document.querySelectorAll('[data-format]').forEach(button => button.onclick = () => { state.payload.preferredFormat = button.dataset.format; queueSave(); renderFormat(); });
}

function renderMoney() {
  const model = financeModel(state.payload);
  dashboardWrap({ head: pageHead('Know the number the restaurant must hit.', 'This is a transparent contribution model, not a promise. Change any assumption and the break-even target updates.'), body: `
    <div class="panel"><div class="form-grid">
      ${field('Average guest check','avgTicket','22','number')}
      ${field('Food and packaging cost %','foodCostPct','30','number')}
      ${field('Monthly fixed operating costs','monthlyFixedCosts','18000','number')}
      ${field('Monthly income you need from the business','monthlyOwnerIncome','5000','number')}
      ${field('Available startup capital','availableCapital','50000','number')}
      ${field('Hours per week you want to work','weeklyHours','45','number')}
    </div></div>
    <div id="financeMetrics" class="grid-3">${financeMetrics(model)}</div>
    <div id="financeRecommendation" class="recommendation" style="margin-top:18px">${financeRecommendation(model)}</div>
    ${nextButton('menu','Design the opening menu')}` });
}

function financeMetrics(model) {
  return `<div class="metric"><span>Monthly break-even sales</span><strong>${money(model.monthlySales)}</strong><small>Includes owner-income goal</small></div>
    <div class="metric"><span>Transactions per day</span><strong>${Math.ceil(model.dailyTransactions)}</strong><small>At ${money(model.ticket)} average check</small></div>
    <div class="metric"><span>Estimated funding gap</span><strong>${money(model.gap)}</strong><small>Against ${model.recommended.name}</small></div>`;
}
function financeRecommendation(model) {
  return `<strong>Current launch logic:</strong> ${escapeHtml(model.recommended.name)} has an estimated planning range of ${money(model.recommended.estimate)}. At your current inputs, the restaurant needs about <strong>${Math.ceil(model.dailyTransactions)} transactions per day</strong> to cover fixed costs and your stated income goal.`;
}
function updateLiveCalculations() {
  if (state.view !== 'money') return;
  const model = financeModel(state.payload);
  const metrics = document.querySelector('#financeMetrics');
  const recommendation = document.querySelector('#financeRecommendation');
  if (metrics) metrics.innerHTML = financeMetrics(model);
  if (recommendation) recommendation.innerHTML = financeRecommendation(model);
}

function renderMenu() {
  const items = state.payload.menuItems || [];
  dashboardWrap({ head: pageHead('Build a focused opening menu.', 'A smaller launch menu reduces equipment, training, inventory, and waste risk. Start with five items you want to be known for.'), body: `
    <div class="panel"><div id="menuList" class="menu-list">${items.length ? items.map((item,index)=>menuRow(item,index)).join('') : '<div class="empty">No menu items yet. Add the first signature item.</div>'}</div>
    <button class="button button-secondary" id="addMenuItem" style="margin-top:14px">Add menu item</button></div>
    <div class="recommendation"><strong>Opening standard:</strong> aim for ingredient overlap, fast training, and one clear reason each item deserves space on the menu.</div>
    ${nextButton('launch','Plan opening day')}` });
  document.querySelector('#addMenuItem').onclick = () => { collectMenu(); state.payload.menuItems.push({name:'',price:0}); renderMenu(); };
  bindMenuRows();
}
function menuRow(item,index) { return `<div class="row-editor"><input class="input" data-menu-name="${index}" value="${escapeHtml(item.name)}" placeholder="Signature item" /><input class="input" data-menu-price="${index}" type="number" min="0" step=".5" value="${Number(item.price)||0}" /><button class="icon-button" data-menu-remove="${index}" title="Remove">×</button></div>`; }
function collectMenu() {
  document.querySelectorAll('[data-menu-name]').forEach(input => { const i=Number(input.dataset.menuName); state.payload.menuItems[i] = state.payload.menuItems[i] || {}; state.payload.menuItems[i].name=input.value; });
  document.querySelectorAll('[data-menu-price]').forEach(input => { const i=Number(input.dataset.menuPrice); state.payload.menuItems[i] = state.payload.menuItems[i] || {}; state.payload.menuItems[i].price=Number(input.value)||0; });
}
function bindMenuRows() {
  document.querySelectorAll('[data-menu-name],[data-menu-price]').forEach(input => input.addEventListener('input',()=>{collectMenu();queueSave();}));
  document.querySelectorAll('[data-menu-remove]').forEach(button => button.onclick=()=>{collectMenu();state.payload.menuItems.splice(Number(button.dataset.menuRemove),1);queueSave();renderMenu();});
}
