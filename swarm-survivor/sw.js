// Stores every file of the build at install, so the game runs offline after one
// visit, whichever renderer chunks this phone happens to need. Pages still try
// the network first, so a new deploy shows up on the next open.

// Both are filled in by scripts/swPrecachePlugin.ts at build time.
const BUILD_ID = '832bb60863b0';
const PRECACHE_FILES = ["assets/CanvasPool-C3ggLJAc.js","assets/RenderTargetSystem-DqHIPho1.js","assets/browserAll-BZW-NFo6.js","assets/canvasUtils-B9YoTnMf.js","assets/getTexelRangeRects-zF5qMI0w.js","assets/getTextureBatchBindGroup-B17mK7lz.js","assets/index-DPAIQUpu.css","assets/index-DcaXxcFm.js","assets/init-C3AM1KU_.js","assets/levelUpScreen-GQY_Nv_L.js","assets/settingsScreen-CQjLGtpt.js","assets/upgradesScreen-CVYF5XyI.js","assets/webworkerAll-CN3D2fHD.js","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","index.html","manifest.webmanifest"];

// The origin is shared with other apps, so cleanup must only touch our caches.
const CACHE_PREFIX = 'swarm-survivor';
const CACHE = `${CACHE_PREFIX}-${BUILD_ID}`;

// How long a page waits for the network before using the stored copy, in
// milliseconds. Lower starts faster on a poor connection, but a new deploy is
// more likely to wait for the next open.
const PAGE_TIMEOUT_MS = 3000;

const pageUrl = () => self.registration.scope;

self.addEventListener('install', (event) => {
  const urls = PRECACHE_FILES.map((file) =>
    file === 'index.html' ? pageUrl() : new URL(file, pageUrl()).href,
  );
  event.waitUntil(
    caches
      .open(CACHE)
      // 'reload' skips the HTTP cache, which could hold files of an older deploy.
      .then((cache) =>
        cache.addAll(urls.map((url) => new Request(url, { cache: 'reload' }))),
      )
      .then(() => self.skipWaiting()),
  );
});

// Every deploy has its own cache, so this also removes the old hashed files.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function waitForTimeout() {
  return new Promise((resolve) =>
    setTimeout(() => resolve(null), PAGE_TIMEOUT_MS),
  );
}

async function servePage(event) {
  const { request } = event;
  const cache = await caches.open(CACHE);
  const network = fetch(request).then((response) => {
    // A failed response must never replace the working copy.
    if (response.ok) event.waitUntil(cache.put(pageUrl(), response.clone()));
    return response;
  });
  const first = await Promise.race([
    network.catch(() => null),
    waitForTimeout(),
  ]);
  if (first && first.ok) return first;
  // Slow, offline or failing: use the stored copy, if there is one yet.
  return (await cache.match(pageUrl())) || network;
}

async function serveFile(request) {
  const cache = await caches.open(CACHE);
  // A file's URL is all that identifies it, whatever the server's Vary header
  // says. Without this a server sending "Vary: Origin" misses for module scripts.
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(pageUrl())) return;
  event.respondWith(
    request.mode === 'navigate' ? servePage(event) : serveFile(request),
  );
});
