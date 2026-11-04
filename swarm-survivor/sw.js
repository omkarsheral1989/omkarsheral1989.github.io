// Minimal service worker. It makes the app installable and lets it run offline
// after the first visit by caching same-origin files as they are fetched.
// Build output filenames are content-hashed, so stale-while-revalidate is safe.
// A fuller precache and "update available" flow is planned for M3.

// Bump the version to drop old caches after changing this file's strategy.
const CACHE = 'swarm-survivor-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Pages go to the network first so a new deploy shows up on the next open;
  // the cached copy is only the offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match(self.registration.scope)),
        ),
    );
    return;
  }

  // Everything else: serve the cache at once, refresh it in the background.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request);
      const refresh = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => hit);
      return hit || refresh;
    }),
  );
});
