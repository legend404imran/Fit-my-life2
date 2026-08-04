/* =========================================================
   FIT MY LIFE — DATABASE LAYER (IndexedDB + localStorage)
   All data access for the entire app goes through DB.*
   ========================================================= */

const DB = (() => {
  const DB_NAME = 'fitMyLifeDB';
  const DB_VERSION = 1;
  const STORES = [
    'food',        // {id, date(YYYY-MM-DD), meal, name, cal, protein, carbs, fat, fiber, sugar, sodium, notes, time, photo}
    'favFoods',    // {id, name, cal, protein, carbs, fat, fiber, sugar, sodium}
    'water',       // {id, date, amount, time}
    'workouts',    // {id, date, name, category, exercises:[{name,sets:[{reps,weight,done}],restSec,notes}], completed}
    'workoutTemplates', // {id, name, category, exercises:[{name,sets,reps,weight}]}
    'personalRecords', // {id, exercise, weight, reps, date}
    'weight',      // {id, date, value}
    'measurements',// {id, date, chest, waist, arms, legs, shoulders, neck}
    'photos',      // {id, date, dataUrl}
    'sleep',       // {id, date, bedTime, wakeTime, hours, quality, notes}
    'habits',      // {id, name, icon, createdAt, log:{date:true}}
    'mood',        // {id, date, mood, note}
    'notes',       // {id, title, body, pinned, createdAt, updatedAt}
    'reminders',   // {id, type, label, time, days, enabled}
    'notifLog',    // {id, message, time}
  ];

  let dbInstance = null;

  function open() {
    return new Promise((resolve, reject) => {
      if (dbInstance) return resolve(dbInstance);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        STORES.forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            const os = db.createObjectStore(store, { keyPath: 'id' });
            if (['food','water','workouts','weight','measurements','photos','sleep','mood'].includes(store)) {
              os.createIndex('date', 'date', { unique: false });
            }
          }
        });
      };
      req.onsuccess = (e) => { dbInstance = e.target.result; resolve(dbInstance); };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  function tx(storeName, mode = 'readonly') {
    return open().then(db => db.transaction(storeName, mode).objectStore(storeName));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  async function add(store, obj) {
    if (!obj.id) obj.id = uid();
    const os = await tx(store, 'readwrite');
    return new Promise((resolve, reject) => {
      const r = os.add(obj);
      r.onsuccess = () => resolve(obj);
      r.onerror = (e) => reject(e.target.error);
    });
  }

  async function put(store, obj) {
    const os = await tx(store, 'readwrite');
    return new Promise((resolve, reject) => {
      const r = os.put(obj);
      r.onsuccess = () => resolve(obj);
      r.onerror = (e) => reject(e.target.error);
    });
  }

  async function get(store, id) {
    const os = await tx(store);
    return new Promise((resolve, reject) => {
      const r = os.get(id);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = (e) => reject(e.target.error);
    });
  }

  async function getAll(store) {
    const os = await tx(store);
    return new Promise((resolve, reject) => {
      const r = os.getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = (e) => reject(e.target.error);
    });
  }

  async function getByDate(store, date) {
    const os = await tx(store);
    return new Promise((resolve, reject) => {
      try {
        const idx = os.index('date');
        const r = idx.getAll(date);
        r.onsuccess = () => resolve(r.result || []);
        r.onerror = (e) => reject(e.target.error);
      } catch (err) {
        // fallback if no index
        getAll(store).then(all => resolve(all.filter(x => x.date === date))).catch(reject);
      }
    });
  }

  async function remove(store, id) {
    const os = await tx(store, 'readwrite');
    return new Promise((resolve, reject) => {
      const r = os.delete(id);
      r.onsuccess = () => resolve(true);
      r.onerror = (e) => reject(e.target.error);
    });
  }

  async function clearStore(store) {
    const os = await tx(store, 'readwrite');
    return new Promise((resolve, reject) => {
      const r = os.clear();
      r.onsuccess = () => resolve(true);
      r.onerror = (e) => reject(e.target.error);
    });
  }

  async function clearAll() {
    for (const s of STORES) await clearStore(s);
  }

  async function exportAll() {
    const data = {};
    for (const s of STORES) data[s] = await getAll(s);
    data.profile = LS.get('profile', null);
    data.settings = LS.get('settings', null);
    data._exportedAt = new Date().toISOString();
    data._version = DB_VERSION;
    return data;
  }

  async function importAll(data) {
    for (const s of STORES) {
      if (Array.isArray(data[s])) {
        await clearStore(s);
        for (const item of data[s]) await put(s, item);
      }
    }
    if (data.profile) LS.set('profile', data.profile);
    if (data.settings) LS.set('settings', data.settings);
  }

  return { open, add, put, get, getAll, getByDate, remove, clearStore, clearAll, exportAll, importAll, uid, STORES };
})();

/* =========================================================
   localStorage wrapper — used for profile/settings (small,
   synchronous-feeling data that needs to be read a lot)
   ========================================================= */
const LS = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem('fml_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try {
      localStorage.setItem('fml_' + key, JSON.stringify(value));
      return true;
    } catch (e) { return false; }
  },
  remove(key) { localStorage.removeItem('fml_' + key); }
};
