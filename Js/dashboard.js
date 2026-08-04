/* =========================================================
   DASHBOARD — home screen
   ========================================================= */

const Dashboard = (() => {

  async function render() {
    const profile = LS.get('profile', {});
    const today = Util.todayStr();

    document.getElementById('dashDate').textContent = Util.formatDateHuman(today);
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    document.getElementById('dashHello').textContent = `${greeting}, ${profile.name || 'Champ'}`;
    document.getElementById('dashQuote').textContent = `"${getRandomQuote()}"`;
    document.getElementById('tipCard').textContent = getRandomTip();

    await renderRings(profile, today);
    await renderQuickStats(profile, today);
    await renderGoalCard(profile);
    await renderStreaks();
    await renderWeekChart();
    await renderUpNext(profile, today);
  }

  async function renderRings(profile, today) {
    const foods = await DB.getByDate('food', today);
    const waters = await DB.getByDate('water', today);
    const calConsumed = foods.reduce((s, f) => s + (f.cal || 0), 0);
    const protConsumed = foods.reduce((s, f) => s + (f.protein || 0), 0);
    const waterConsumed = waters.reduce((s, w) => s + (w.amount || 0), 0);

    const calGoal = profile.dailyCalories || 2000;
    const protGoal = profile.proteinGoal || 120;
    const waterGoal = profile.waterGoal || 2500;

    setRing('ringCal', calConsumed / calGoal, 104);
    setRing('ringProt', protConsumed / protGoal, 78);
    setRing('ringWater', waterConsumed / waterGoal, 52);

    document.getElementById('ringCalLeft').textContent = Math.max(0, Math.round(calGoal - calConsumed));
    document.getElementById('legCal').textContent = `${Math.round(calConsumed)}/${calGoal}`;
    document.getElementById('legProt').textContent = `${Math.round(protConsumed)}/${protGoal}g`;
    document.getElementById('legWater').textContent = `${waterConsumed}/${waterGoal}ml`;
  }

  function setRing(id, ratio, radius) {
    const circ = 2 * Math.PI * radius;
    const clamped = Math.min(1, Math.max(0, ratio || 0));
    const el = document.getElementById(id);
    el.style.strokeDasharray = `${circ}`;
    el.style.strokeDashoffset = `${circ}`;
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = `${circ * (1 - clamped)}`;
    });
  }

  async function renderQuickStats(profile, today) {
    const weights = await DB.getByDate('weight', today);
    const allWeights = await DB.getAll('weight');
    const latestWeight = weights[0]?.value || (allWeights.sort((a,b)=>b.date.localeCompare(a.date))[0]?.value) || profile.weight || 0;
    const bmi = Util.calcBMI(latestWeight, profile.height);
    const sleeps = await DB.getByDate('sleep', Util.todayStr(-1));
    const workouts = await DB.getByDate('workouts', today);
    const workoutDone = workouts.some(w => w.completed);

    const stats = [
      { icon: 'M12 2v20M2 12h20', val: latestWeight ? `${latestWeight}kg` : '—', label: 'Weight' },
      { icon: 'M3 12h4l3 8 4-16 3 8h4', val: bmi || '—', label: 'BMI' },
      { icon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z', val: sleeps[0] ? `${sleeps[0].hours}h` : '—', label: 'Sleep' },
      { icon: 'M6.5 6.5l11 11M4 12h2M18 12h2', val: workoutDone ? 'Done ✓' : 'Pending', label: 'Workout' },
      { icon: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z', val: LS.get('todaySteps_' + today, '—'), label: 'Steps' },
      { icon: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z', val: LS.get('heartRate_' + today, '—'), label: 'Heart Rate' }
    ];

    document.getElementById('quickStatsGrid').innerHTML = stats.map(s => `
      <div class="qstat" data-stat="${s.label}">
        <svg class="qstat-icon" viewBox="0 0 24 24"><path d="${s.icon}"/></svg>
        <div class="qstat-val">${s.val}</div>
        <div class="qstat-label">${s.label}</div>
      </div>
    `).join('');

    // clickable manual stats
    document.querySelectorAll('[data-stat="Steps"]').forEach(el => el.onclick = () => promptManualStat('Steps', 'steps', 'todaySteps_' + today));
    document.querySelectorAll('[data-stat="Heart Rate"]').forEach(el => el.onclick = () => promptManualStat('Heart Rate', 'bpm', 'heartRate_' + today));
  }

  function promptManualStat(label, unit, lsKey) {
    Util.openModal(`
      <h3 class="modal-title">Log ${Util.sanitize(label)}</h3>
      <label class="field-label">${Util.sanitize(label)} (${Util.sanitize(unit)})</label>
      <input type="number" class="input" id="manualStatInput" value="${LS.get(lsKey, '')}">
      <div class="modal-actions">
        <button class="btn-ghost" id="manualCancel">Cancel</button>
        <button class="btn-primary" id="manualSave">Save</button>
      </div>
    `);
    document.getElementById('manualCancel').onclick = Util.closeModal;
    document.getElementById('manualSave').onclick = () => {
      const v = document.getElementById('manualStatInput').value;
      LS.set(lsKey, v);
      Util.closeModal();
      render();
      Util.toast('Saved', 'success');
    };
  }

  async function renderGoalCard(profile) {
    const goalLabels = { lose: 'Losing Fat', gain: 'Gaining Muscle', maintain: 'Maintaining Weight' };
    document.getElementById('goalCard').innerHTML = `
      <div class="goal-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
      <div class="goal-text">
        <b>${goalLabels[profile.goal] || 'Set your goal'}</b>
        <span>Target: ${profile.targetWeight ? profile.targetWeight + 'kg' : 'Not set'} · ${profile.dailyCalories || 2000} kcal/day</span>
      </div>
    `;
  }

  async function renderStreaks() {
    const habits = await DB.getAll('habits');
    const workouts = await DB.getAll('workouts');
    const workoutStreak = calcWorkoutStreak(workouts);
    const habitStreak = habits.length ? Math.max(...habits.map(h => calcHabitStreak(h))) : 0;
    const today = new Date();
    const weekNum = Math.ceil((((today - new Date(today.getFullYear(),0,1)) / 86400000) + new Date(today.getFullYear(),0,1).getDay()+1)/7);

    document.getElementById('streakRow').innerHTML = `
      <div class="streak-card"><div class="streak-flame">🔥</div><div class="streak-num">${workoutStreak}</div><div class="streak-label">Workout Streak</div></div>
      <div class="streak-card"><div class="streak-flame">⭐</div><div class="streak-num">${habitStreak}</div><div class="streak-label">Best Habit Streak</div></div>
      <div class="streak-card"><div class="streak-flame">📅</div><div class="streak-num">W${weekNum}</div><div class="streak-label">${today.toLocaleString('default',{month:'short'})}</div></div>
    `;
  }

  function calcWorkoutStreak(workouts) {
    const doneDates = new Set(workouts.filter(w => w.completed).map(w => w.date));
    let streak = 0, i = 0;
    while (doneDates.has(Util.todayStr(-i))) { streak++; i++; }
    return streak;
  }

  function calcHabitStreak(habit) {
    let streak = 0, i = 0;
    while (habit.log && habit.log[Util.todayStr(-i)]) { streak++; i++; }
    return streak;
  }

  async function renderWeekChart() {
    const days = Util.last7Days();
    const profile = LS.get('profile', {});
    const values = [];
    for (const d of days) {
      const foods = await DB.getByDate('food', d);
      values.push(foods.reduce((s, f) => s + (f.cal || 0), 0));
    }
    const labels = days.map(d => Util.strToDate(d).toLocaleDateString('en', { weekday: 'narrow' }));
    Charts.barChart(document.getElementById('weekChart'), labels, values, {
      max: profile.dailyCalories ? profile.dailyCalories * 1.2 : undefined
    });
  }

  async function renderUpNext(profile, today) {
    const workouts = await DB.getByDate('workouts', today);
    const pending = workouts.find(w => !w.completed);
    const templates = await DB.getAll('workoutTemplates');
    let html = '';
    if (pending) {
      html = `<div class="goal-text"><b>${Util.sanitize(pending.name)}</b><span>${pending.exercises.length} exercises planned today</span></div>`;
    } else if (templates.length) {
      html = `<div class="goal-text"><b>${Util.sanitize(templates[0].name)}</b><span>Suggested from your templates — tap Train to start</span></div>`;
    } else {
      html = `<div class="goal-text"><b>No workout planned</b><span>Head to Train to create one</span></div>`;
    }
    document.getElementById('upNextCard').innerHTML = html;
  }

  return { render };
})();
