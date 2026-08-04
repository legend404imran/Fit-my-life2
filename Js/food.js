/* =========================================================
   FOOD TRACKER
   ========================================================= */

const Food = (() => {
  let activeMeal = 'breakfast';

  async function render() {
    await renderMacroSummary();
    await renderMealList();
    await renderFavorites();
  }

  async function renderMacroSummary() {
    const profile = LS.get('profile', {});
    const foods = await DB.getByDate('food', Util.todayStr());
    const totals = foods.reduce((acc, f) => {
      acc.cal += f.cal || 0; acc.protein += f.protein || 0; acc.carbs += f.carbs || 0; acc.fat += f.fat || 0;
      return acc;
    }, { cal: 0, protein: 0, carbs: 0, fat: 0 });

    const items = [
      { label: 'Calories', val: Math.round(totals.cal), goal: profile.dailyCalories || 2000, color: 'var(--accent)' },
      { label: 'Protein', val: Math.round(totals.protein), goal: profile.proteinGoal || 120, color: 'var(--blue)', unit: 'g' },
      { label: 'Carbs', val: Math.round(totals.carbs), goal: profile.carbsGoal || 200, color: 'var(--amber)', unit: 'g' },
      { label: 'Fat', val: Math.round(totals.fat), goal: profile.fatGoal || 60, color: 'var(--purple)', unit: 'g' }
    ];

    document.getElementById('macroSummary').innerHTML = items.map(it => `
      <div class="macro-item">
        <div class="macro-val">${it.val}${it.unit || ''}</div>
        <div class="macro-bar-bg"><div class="macro-bar-fill" style="width:${Math.min(100,(it.val/it.goal)*100)}%;background:${it.color}"></div></div>
        <div class="macro-label">${it.label}</div>
      </div>
    `).join('');
  }

  async function renderMealList() {
    const foods = (await DB.getByDate('food', Util.todayStr())).filter(f => f.meal === activeMeal);
    document.querySelectorAll('.meal-tab').forEach(t => t.classList.toggle('active', t.dataset.meal === activeMeal));

    if (!foods.length) {
      document.getElementById('mealList').innerHTML = `<div class="empty-state">No ${activeMeal} logged yet today.</div>`;
      return;
    }
    document.getElementById('mealList').innerHTML = foods.map(f => `
      <div class="food-item">
        <div>
          <div class="food-item-name">${Util.sanitize(f.name)}</div>
          <div class="food-item-sub">P:${f.protein||0}g · C:${f.carbs||0}g · F:${f.fat||0}g ${f.time ? '· ' + f.time : ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="food-item-cal">${f.cal || 0}</div>
          <button class="food-item-del" data-id="${f.id}"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg></button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('#mealList .food-item-del').forEach(btn => {
      btn.onclick = () => Util.confirmAction('Delete this food entry?', async () => {
        await DB.remove('food', btn.dataset.id);
        render();
        Dashboard.render();
        Util.toast('Removed', 'success');
      });
    });
  }

  async function renderFavorites() {
    const favs = await DB.getAll('favFoods');
    if (!favs.length) {
      document.getElementById('favFoodsRow').innerHTML = `<div class="empty-state" style="padding:16px;">Mark foods as favorite for quick-add here.</div>`;
      return;
    }
    document.getElementById('favFoodsRow').innerHTML = favs.map(f => `
      <button class="chip" data-favid="${f.id}">${Util.sanitize(f.name)} · ${f.cal}kcal</button>
    `).join('');
    document.querySelectorAll('[data-favid]').forEach(chip => {
      chip.onclick = async () => {
        const f = favs.find(x => x.id === chip.dataset.favid);
        await DB.add('food', { ...f, id: undefined, meal: activeMeal, date: Util.todayStr(), time: Util.nowTime() });
        render(); Dashboard.render();
        Util.toast(`${f.name} added`, 'success');
      };
    });
  }

  function openAddFoodModal() {
    Util.openModal(`
      <h3 class="modal-title">Add Food — ${activeMeal[0].toUpperCase()+activeMeal.slice(1)}</h3>
      <label class="field-label">Food Name</label>
      <input class="input" id="fName" placeholder="e.g. Grilled Chicken Breast">
      <div class="field-row">
        <div><label class="field-label">Calories</label><input type="number" class="input" id="fCal" placeholder="0"></div>
        <div><label class="field-label">Protein (g)</label><input type="number" class="input" id="fProt" placeholder="0"></div>
      </div>
      <div class="field-row">
        <div><label class="field-label">Carbs (g)</label><input type="number" class="input" id="fCarb" placeholder="0"></div>
        <div><label class="field-label">Fat (g)</label><input type="number" class="input" id="fFat" placeholder="0"></div>
      </div>
      <div class="field-row">
        <div><label class="field-label">Fiber (g)</label><input type="number" class="input" id="fFiber" placeholder="0"></div>
        <div><label class="field-label">Sugar (g)</label><input type="number" class="input" id="fSugar" placeholder="0"></div>
      </div>
      <label class="field-label">Sodium (mg)</label>
      <input type="number" class="input" id="fSodium" placeholder="0">
      <label class="field-label">Notes</label>
      <input class="input" id="fNotes" placeholder="Optional">
      <label class="field-label">Photo (optional, stored locally)</label>
      <input type="file" accept="image/*" class="input" id="fPhoto" style="padding:10px;">
      <label style="display:flex;align-items:center;gap:8px;margin-top:14px;font-size:13px;color:var(--text-1);">
        <input type="checkbox" id="fFav" style="width:16px;height:16px;"> Save to Favorites
      </label>
      <div class="modal-actions">
        <button class="btn-ghost" id="fCancel">Cancel</button>
        <button class="btn-primary" id="fSave">Add Food</button>
      </div>
    `);
    document.getElementById('fCancel').onclick = Util.closeModal;
    document.getElementById('fSave').onclick = saveFood;
  }

  async function saveFood() {
    const name = document.getElementById('fName').value.trim();
    if (!name) { Util.toast('Enter a food name', 'error'); return; }
    const entry = {
      date: Util.todayStr(), meal: activeMeal, name,
      cal: +document.getElementById('fCal').value || 0,
      protein: +document.getElementById('fProt').value || 0,
      carbs: +document.getElementById('fCarb').value || 0,
      fat: +document.getElementById('fFat').value || 0,
      fiber: +document.getElementById('fFiber').value || 0,
      sugar: +document.getElementById('fSugar').value || 0,
      sodium: +document.getElementById('fSodium').value || 0,
      notes: document.getElementById('fNotes').value.trim(),
      time: Util.nowTime()
    };

    const photoFile = document.getElementById('fPhoto').files[0];
    const isFav = document.getElementById('fFav').checked;

    const finish = async () => {
      await DB.add('food', entry);
      if (isFav) await DB.add('favFoods', { name: entry.name, cal: entry.cal, protein: entry.protein, carbs: entry.carbs, fat: entry.fat, fiber: entry.fiber, sugar: entry.sugar, sodium: entry.sodium });
      Util.closeModal();
      render();
      Dashboard.render();
      Util.toast('Food added', 'success');
    };

    if (photoFile) {
      const reader = new FileReader();
      reader.onload = async () => { entry.photo = reader.result; await finish(); };
      reader.readAsDataURL(photoFile);
    } else {
      await finish();
    }
  }

  function bindEvents() {
    document.querySelectorAll('.meal-tab').forEach(tab => {
      tab.onclick = () => { activeMeal = tab.dataset.meal; renderMealList(); };
    });
    document.getElementById('btnAddFood').onclick = openAddFoodModal;
  }

  return { render, bindEvents, openAddFoodModal, get activeMeal() { return activeMeal; }, set activeMeal(v) { activeMeal = v; } };
})();
