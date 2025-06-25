const CACHE_NAME = "v1";

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
    console.log("[SW] Install event");
    event.waitUntil(
        addResourcesToCache([
            "/",
            "/index.html",
            "/style.css",
            "/main.js",
            "/offline.json",
        ])
    );
    self.skipWaiting(); // Langsung masuk ke activate
});

self.addEventListener("activate", (event) => {
    console.log("[SW] Activate event");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => {
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    event.waitUntil(clients.claim());
});

// Fetch handler
self.addEventListener("fetch", (event) => {
    let request = event.request;
    let url = new URL(request.url);

    if (url.origin === location.origin) {
        // Internal
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(request);
            })
        );
    } else {
        // External
        event.respondWith(
            caches.open("product-cache").then(cache => {
                return fetch(request).then(liveResponse => {
                    cache.put(request, liveResponse.clone());
                    return liveResponse;
                }).catch(() => {
                    return caches.match(request).then(response => {
                        return response || caches.match("/offline.json");
                    });
                });
            })
        );
    }
});
