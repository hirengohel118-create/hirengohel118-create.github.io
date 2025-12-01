// Vamika Estate CRM service worker (schedules stored in IndexedDB, checks every 60s)
// This worker shows local notifications when schedule is due.
// NOTE: Service workers can stop & restart; on activation we start the check loop.
// Works while Chrome is running in background.

const CACHE = 'vamika-crm-cache-v1';
const FILES = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.json', '/logo.png'];
const DB_NAME = 'vamika_schedules_db';
const DB_STORE = 'schedules';
const CHECK_INTERVAL = 60 * 1000; // 60 seconds

// simple indexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(item) {
  return openDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(item);
    tx.oncomplete = () => { db.close(); res(true); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  }));
}

function idbGetAll() {
  return openDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const req = store.getAll();
    req.onsuccess = () => { db.close(); res(req.result || []); };
    req.onerror = () => { db.close(); rej(req.error); };
  }));
}

function idbDelete(id) {
  return openDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => { db.close(); res(true); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  }));
}

// caching (unchanged from previous sw)
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  self.clients.claim();
  // start the periodic check loop
  startCheckLoop();
});

// handle fetch normally (fallback to network)
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

// message handler: receives schedule messages from app
self.addEventListener('message', (e) => {
  try {
    const data = e.data || {};
    if (!data || !data.type) return;
    if (data.type === 'schedule') {
      // data: { type:'schedule', id, name, time }
      const payload = {
        id: data.id,
        name: data.name,
        time: Number(data.time),
        created: Date.now()
      };
      // store schedule
      idbPut(payload).catch(()=>{});
    } else if (data.type === 'cancel') {
      if (data.id) idbDelete(data.id).catch(()=>{});
    }
  } catch (err) { /* ignore */ }
});

// check loop
let _checkTimer = null;
function startCheckLoop() {
  if (_checkTimer) return;
  _checkTimer = setInterval(() => {
    checkAndFire();
  }, CHECK_INTERVAL);
  // run immediate check on start
  setTimeout(() => checkAndFire(), 1000);
}

async function checkAndFire() {
  try {
    const now = Date.now();
    const items = await idbGetAll();
    if (!items || items.length === 0) return;
    for (const it of items) {
      // Fire when time <= now
      if (it.time && Number(it.time) <= now) {
        // Show notification (single fire)
        const title = 'Vamika Estate Reminder';
        const body = `Call ${it.name} regarding their inquiry.`;
        const options = {
          body,
          tag: it.id,
          renotify: false,
          data: { id: it.id },
          vibrate: [100, 50, 100]
        };
        self.registration.showNotification(title, options);
        // remove schedule so it doesn't fire again
        await idbDelete(it.id).catch(()=>{});
        // send message to all clients that a schedule fired (so app UI can mark lastNotified)
        const clientsList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
        clientsList.forEach(c => c.postMessage({ type: 'fired', id: it.id }));
      }
    }
  } catch (err) {
    // fail silently
    console.warn('checkAndFire error', err);
  }
}

// notification click: focus/open client
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const id = event.notification.data && event.notification.data.id;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        // focus first client
        const client = clientList[0];
        client.focus();
        // optionally post a message to client to open lead
        if (id) client.postMessage({ type: 'open_lead', id });
        return;
      }
      // otherwise open a new window
      let url = '/';
      if (id) url = '/?open=' + encodeURIComponent(id);
      return self.clients.openWindow(url);
    })
  );
});
