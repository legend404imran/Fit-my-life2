/* =========================================================
   MOOD TRACKER
   ========================================================= */

const Mood = (() => {
  const MOODS = [
    { key: 'happy', emoji: '😊', label: 'Happy' },
    { key: 'normal', emoji: '😐', label: 'Normal' },
    { key: 'sad', emoji: '😔', label: 'Sad' },
    { key: 'energetic', emoji: '⚡', label: 'Energetic' },
    { key: 'tired', emoji: '😴', label: 'Tired' },
    { key: 'motivated', emoji: '🔥', label: 'Motivated' },
    { key: 'stressed', emoji: '😣', label: 'Stressed' },
    { key: 'calm', emoji: '😌', label: 'Calm' },
  ];

  async function render() {
    const today = Util.todayStr();
    const todayEntry = (await DB.getByDate('mood', today))[0];

    document.getElementById('moodPicker').innerHTML = MOODS.map(m => `
      <button class="mood-opt ${todayEntry?.mood===m.key?'selected':''}" data-mood="${m.key}">
        <span class="mood-emoji">${m.emoji}</span>
        <span class="mood-label">${m.label}</span>
      </button>
    `).join('');

    document.querySelectorAll('[data-mood]').forEach(btn => {
      btn.onclick = () => saveMood(btn.dataset.mood, todayEntry);
    });

    await renderChart();
    await renderHistory();
  }

  async function saveMood(moodKey, existing) {
    const entry = { id: existing?.id, date: Util.todayStr(), mood: moodKey, note: existing?.note || '' };
    await DB.put('mood', entry);
    Util.vibrate(15);
    render(); Dashboard.render();
    Util.toast('Mood logged', 'success');
  }

  async function renderChart() {
    const days = Util.daysInRange(-29, 0);
    const moodScore = { happy: 5, energetic: 5, motivated: 5, calm: 4, normal: 3, tired: 2, stressed: 1, sad: 1 };
    const values = [];
    for (const d of days) {
      const e = (await DB.getByDate('mood', d))[0];
      values.push(e ? moodScore[e.mood] || 3 : 0);
    }
    const labels = days.map((d,i) => i % 5 === 0 ? Util.formatDateShort(d) : '');
    Charts.lineChart(document.getElementById('moodChart'), labels, values, { color: 'var(--amber)', max: 5.5 });
  }

  async function renderHistory() {
    const all = (await DB.getAll('mood')).sort((a,b)=>b.date.localeCompare(a.date));
    const moodMap = Object.fromEntries(MOODS.map(m => [m.key, m]));
    document.getElementById('moodHistory').innerHTML = all.slice(0,20).map(e => `
      <div class="log-item">
        <span>${Util.formatDateShort(e.date)}</span>
        <span>${moodMap[e.mood]?.emoji || ''} ${moodMap[e.mood]?.label || e.mood}</span>
      </div>
    `).join('') || '<div class="empty-state">No mood entries yet.</div>';
  }

  return { render };
})();
