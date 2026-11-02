const CACHE_NAME = "todo-app-php-v2";

const ASSETS_TO_PRECACHE = [
  "./",
  "./index.php",
  "./offline.html",
  "./manifest.json",
  "./assets/style.css",
  "./assets/script.js",
  "./assets/icons/icon-192x192.png",
  "./assets/icons/icon-512x512.png"
];

// 1. Install Event: Precache App Shell & Offline Page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_PRECACHE))
  );
  self.skipWaiting();
});

// 2. Activate Event: Cleanup Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// 3. Fetch Event: Strategy per Resource
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Hanya proses method GET
  if (request.method !== "GET") return;

  // Strategi A: Navigasi Halaman (HTML/PHP) -> Network First, Fallback Cache / offline.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match("./offline.html");
        })
    );
    return;
  }

  // Strategi B: Static Assets (CSS, JS, Images, Icons) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Failure handling for offline static asset fetch
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Notification Click Event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});