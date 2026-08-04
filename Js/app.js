/* =========================================================
   APP — main controller: routing, nav, boot sequence
   ========================================================= */

const App = (() => {
  let currentScreen = 'dashboard';
  let deferredInstallPrompt = null;

  const SCREEN_TITLES = {
    dashboard: 'Dashboard', food: 'Food Tracker', water: 'Water Tracker',
    workout: 'Workout Tracker', progress: 'Progress', sleep: 'Sleep Tracker',
    habits: 'Habit Tracker', mood: 'Mood Tracker', notes: 'Notes & Journal',
    calendar: 'Calendar', reports: 'Reports', profile: 'Profile', settings: 'Settings'
  };

  async function init() {
    Settings.applyOnLoad();
    registerServiceWorker();
    setupInstallPrompt();

    const profile = LS.get('profile', null);
    if (!profile) {
      document.getElementById('splash').classList.add('hidden');
      Onboarding.start();
    } else {
      await boot();
    }
  }

  async function boot() {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('onboarding').classList.add('hidden');
    document.getElementById('topbar').classList.remove('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('bottomNav').classList.remove('hidden');

    bindNav();
    bindSideMenu();
    bindMoreSheet();
    bindFabSheet();
    bindModal();
    Food.bindEvents();
    Water.bindEvents();
    Workout.bindEvents();
    Progress.bindTabs();
    Habits.bindEvents();
    Notes.bindEvents();
    Cal.bindEvents();
    Reports.bindEvents();

    document.getElementById('btnSearch').onclick = Search.open;

    updateSideMenu();
    await navigateTo('dashboard');
    Notify.startScheduler();
  }

  async function navigateTo(screen) {
    if (screen === 'fab') { openFabSheet(); return; }
    if (screen === 'more') { openMoreSheet(); return; }

    currentScreen = screen;
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(`screen-${screen}`);
    if (target) target.classList.remove('hidden');
    document.getElementById('topbarTitle').textContent = SCREEN_TITLES[screen] || 'Fit My Life';

    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === screen));

    closeSideMenu(); closeMoreSheet(); closeFabSheet();

    const renderers = {
      dashboard: Dashboard.render, food: Food.render, water: Water.render,
      workout: Workout.render, progress: Progress.render, sleep: Sleep.render,
      habits: Habits.render, mood: Mood.render, notes: Notes.render,
      calendar: Cal.render, reports: Reports.render, profile: Profile.render,
      settings: Settings.render
    };
    if (renderers[screen]) await renderers[screen]();
  }

  function bindNav() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.onclick = () => navigateTo(el.dataset.nav);
    });
  }

  function bindSideMenu() {
    document.getElementById('btnMenu').onclick = openSideMenu;
    document.getElementById('sideMenuOverlay').onclick = closeSideMenu;
  }
  function openSideMenu() {
    document.getElementById('sideMenu').classList.add('open');
    document.getElementById('sideMenuOverlay').classList.remove('hidden');
  }
  function closeSideMenu() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('sideMenuOverlay').classList.add('hidden');
  }

  function bindMoreSheet() {
    document.getElementById('moreSheetOverlay').onclick = closeMoreSheet;
  }
  function openMoreSheet() {
    document.getElementById('moreSheet').classList.add('open');
    document.getElementById('moreSheetOverlay').classList.remove('hidden');
  }
  function closeMoreSheet() {
    document.getElementById('moreSheet').classList.remove('open');
    document.getElementById('moreSheetOverlay').classList.add('hidden');
  }

  function bindFabSheet() {
    document.getElementById('fabSheetOverlay').onclick = closeFabSheet;
    document.getElementById('qaWater').onclick = () => { closeFabSheet(); navigateTo('water'); };
    document.getElementById('qaFood').onclick = () => { closeFabSheet(); navigateTo('food').then(() => Food.openAddFoodModal()); };
    document.getElementById('qaWorkout').onclick = () => { closeFabSheet(); navigateTo('workout'); };
    document.getElementById('qaWeight').onclick = () => { closeFabSheet(); navigateTo('progress').then(() => { document.querySelector('[data-p="weight"]').click(); }); };
    document.getElementById('qaNote').onclick = () => { closeFabSheet(); Notes.openNoteModal(); };
    document.getElementById('qaMood').onclick = () => { closeFabSheet(); navigateTo('mood'); };
  }
  function openFabSheet() {
    document.getElementById('fabSheet').classList.add('open');
    document.getElementById('fabSheetOverlay').classList.remove('hidden');
  }
  function closeFabSheet() {
    document.getElementById('fabSheet').classList.remove('open');
    document.getElementById('fabSheetOverlay').classList.add('hidden');
  }

  function bindModal() {
    document.getElementById('modalOverlay').onclick = Util.closeModal;
  }

  function updateSideMenu() {
    const p = LS.get('profile', {});
    document.getElementById('sideAvatar').textContent = (p.name || 'F')[0].toUpperCase();
    document.getElementById('sideName').textContent = p.name || 'Your Name';
    const goalLabels = { lose: 'Losing Fat', gain: 'Gaining Muscle', maintain: 'Maintaining' };
    document.getElementById('sideGoal').textContent = goalLabels[p.goal] || 'Set your goal';
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  }

  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (!LS.get('installDismissed', false)) {
        document.getElementById('installBanner').classList.remove('hidden');
      }
    });
    document.getElementById('btnInstall').onclick = async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      document.getElementById('installBanner').classList.add('hidden');
    };
    document.getElementById('btnDismissInstall').onclick = () => {
      document.getElementById('installBanner').classList.add('hidden');
      LS.set('installDismissed', true);
    };
  }

  return { init, boot, navigateTo, updateSideMenu };
})();

document.addEventListener('DOMContentLoaded', App.init);
