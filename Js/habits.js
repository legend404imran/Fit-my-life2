/* =========================================================
   HABIT TRACKER
   ========================================================= */

const Habits = (() => {

  async function render() {
    const habits = await DB.getAll('habits');
    if (!habits.length) {
      document.getElementById('habitList').innerHTML = `<div class="empty-state">No habits yet. Tap "New Habit" to start building your routine.</div>`;
      return;
    }
    const today = Util.todayStr();
    document.getElementById('habitList').innerHTML = habits.map(h => {
      const done = !!(h.log && h.log[today]);
      const streak = calcStreak(h);
      return `
        <div class="habit-card">
          <button class="habit-check ${done?'done':''}" data-toggle="${h.id}">
            ${done ? '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M20 6L9 17l-5-5"/></svg>' : h.icon || '●'}
          </button>
          <div class="habit-info">
            <div class="habit-name">${Util.sanitize(h.name)}</div>
            <div class="habit-streak">🔥 ${streak} day streak</div>
          </div>
          <button class="habit-del" data-delhabit="${h.id}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>
          </button>
        </div>
      `;
    }).join('');

    document.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.onclick = async () => {
        const h = habits.find(x => x.id === btn.dataset.toggle);
        h.log = h.log || {};
        h.log[today] = !h.log[today];
        if (!h.log[today]) delete h.log[today];
        await DB.put('habits', h);
        Util.vibrate(15);
        render(); Dashboard.render();
      };
    });
    document.querySelectorAll('[data-delhabit]').forEach(btn => {
      btn.onclick = () => Util.confirmAction('Delete this habit and its history?', async () => {
        await DB.remove('habits', btn.dataset.delhabit);
        render(); Dashboard.render();
      });
    });
  }

  function calcStreak(h) {
    let streak = 0, i = 0;
    while (h.log && h.log[Util.todayStr(-i)]) { streak++; i++; }
    return streak;
  }

  function openAddHabitModal() {
    const presets = ['Gym','Reading','Meditation','Walking','Stretching','Running','No Sugar','No Junk Food'];
    Util.openModal(`
      <h3 class="modal-title">New Habit</h3>
      <label class="field-label">Habit Name</label>
      <input class="input" id="hName" placeholder="e.g. Morning Meditation" list="habitPresets">
      <datalist id="habitPresets">${presets.map(p=>`<option value="${p}">`).join('')}</datalist>
      <div class="modal-actions">
        <button class="btn-ghost" id="hCancel">Cancel</button>
        <button class="btn-primary" id="hSave">Create</button>
      </div>
    `);
    document.getElementById('hCancel').onclick = Util.closeModal;
    document.getElementById('hSave').onclick = async () => {
      const name = document.getElementById('hName').value.trim();
      if (!name) { Util.toast('Enter a habit name', 'error'); return; }
      await DB.add('habits', { name, icon: '●', createdAt: new Date().toISOString(), log: {} });
      Util.closeModal(); render();
      Util.toast('Habit created', 'success');
    };
  }

  function bindEvents() {
    document.getElementById('btnAddHabit').onclick = openAddHabitModal;
  }

  return { render, bindEvents };
})();
