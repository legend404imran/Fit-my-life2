/* =========================================================
   CALENDAR
   ========================================================= */

const Cal = (() => {
  let viewYear, viewMonth, selectedDate = null;

  function init() {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
  }

  async function render() {
    if (viewYear === undefined) init();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('calMonthLabel').textContent = `${months[viewMonth]} ${viewYear}`;

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayStr = Util.todayStr();

    // gather activity data for the month
    const [foods, waters, workouts, weights, sleeps, moods] = await Promise.all([
      DB.getAll('food'), DB.getAll('water'), DB.getAll('workouts'), DB.getAll('weight'), DB.getAll('sleep'), DB.getAll('mood')
    ]);

    const dows = ['S','M','T','W','T','F','S'];
    let html = dows.map(d => `<div class="cal-dow">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-cell empty"></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;
      const dots = [];
      if (foods.some(f => f.date === dateStr)) dots.push('var(--accent)');
      if (waters.some(w => w.date === dateStr)) dots.push('var(--blue)');
      if (workouts.some(w => w.date === dateStr)) dots.push('var(--amber)');
      if (moods.some(m => m.date === dateStr)) dots.push('var(--purple)');

      html += `
        <div class="cal-cell ${isToday?'today':''} ${isSelected?'selected':''}" data-date="${dateStr}">
          <span>${day}</span>
          <div class="cal-dot-row">${dots.slice(0,3).map(c=>`<span class="cal-dot" style="background:${c}"></span>`).join('')}</div>
        </div>
      `;
    }
    document.getElementById('calGrid').innerHTML = html;
    document.querySelectorAll('[data-date]').forEach(cell => {
      cell.onclick = () => { selectedDate = cell.dataset.date; render(); renderDayDetail(); };
    });

    if (selectedDate) renderDayDetail();
  }

  async function renderDayDetail() {
    document.getElementById('calDayTitle').textContent = Util.formatDateHuman(selectedDate);
    const [foods, waters, workouts, weights, sleeps, moods, habits, notes] = await Promise.all([
      DB.getByDate('food', selectedDate), DB.getByDate('water', selectedDate), DB.getByDate('workouts', selectedDate),
      DB.getByDate('weight', selectedDate), DB.getByDate('sleep', selectedDate), DB.getByDate('mood', selectedDate),
      DB.getAll('habits'), DB.getAll('notes')
    ]);

    const totalCal = foods.reduce((s,f)=>s+(f.cal||0),0);
    const totalWater = waters.reduce((s,w)=>s+w.amount,0);
    const habitsCompleted = habits.filter(h => h.log && h.log[selectedDate]).length;
    const dayNotes = notes.filter(n => n.createdAt.slice(0,10) === selectedDate);

    let rows = [];
    if (foods.length) rows.push(`<div class="report-row"><span>Food logged</span><b>${foods.length} items · ${Math.round(totalCal)} kcal</b></div>`);
    if (waters.length) rows.push(`<div class="report-row"><span>Water</span><b>${totalWater}ml</b></div>`);
    if (workouts.length) rows.push(`<div class="report-row"><span>Workout</span><b>${workouts.map(w=>w.name).join(', ')} ${workouts.some(w=>w.completed)?'✅':''}</b></div>`);
    if (weights.length) rows.push(`<div class="report-row"><span>Weight</span><b>${weights[0].value}kg</b></div>`);
    if (sleeps.length) rows.push(`<div class="report-row"><span>Sleep</span><b>${sleeps[0].hours}h · ${sleeps[0].quality}</b></div>`);
    if (moods.length) rows.push(`<div class="report-row"><span>Mood</span><b>${moods[0].mood}</b></div>`);
    if (habitsCompleted) rows.push(`<div class="report-row"><span>Habits done</span><b>${habitsCompleted}/${habits.length}</b></div>`);
    if (dayNotes.length) rows.push(`<div class="report-row"><span>Notes</span><b>${dayNotes.length} written</b></div>`);

    document.getElementById('calDayDetail').innerHTML = rows.length ? rows.join('') : `<div class="empty-state">No data logged for this day.</div>`;
  }

  function bindEvents() {
    document.getElementById('calPrev').onclick = () => {
      viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      render();
    };
    document.getElementById('calNext').onclick = () => {
      viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    };
  }

  return { render, bindEvents };
})();
