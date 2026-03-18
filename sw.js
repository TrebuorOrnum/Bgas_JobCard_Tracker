// ── Brackenfell Gas Job Card Manager ──
// Bump CACHE_NAME version any time you deploy updated files
const CACHE_NAME = 'bg-jobs-v7';
const ASSETS = ['./index.html', './manifest.json'];

// Install: cache assets and immediately take control
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting(); // activate immediately, don't wait for old SW to die
});

// Activate: delete ALL old caches so stale versions are wiped
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        }
      }))
    )
  );
  self.clients.claim(); // take control of all open tabs immediately
});

// Fetch: NETWORK FIRST — always try to get fresh files from server.
// Only fall back to cache if network fails (offline).
self.addEventListener('fetch', e => {
  // Only handle GET requests for our own origin
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(networkRes => {
        // Got a fresh response — update cache and return it
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return networkRes;
      })
      .catch(() => {
        // Network failed — serve from cache (offline fallback)
        return caches.match(e.request).then(cached => {
          return cached || caches.match('./index.html');
        });
      })
  );
});
