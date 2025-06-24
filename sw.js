const CACHE_NAME = "v1";
const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([
            "/",
            "/index.html",
            "/style.css",
            "/main.js",
            "/offline.json",
        ]),
    );
});

// ini cahche sederhana
// self.addEventListener("fetch", (event) => {
//     event.respondWith(caches.match(event.request).then(response => {
//         if (response) {
//             return response;
//         } else {
//             return fetch(event.request);
//         }
//     }));
// });

// cache 
self.addEventListener("fetch", (event) => {
    let request = event.request;
    let url = new URL(request.url);

    // Jika berasal dari origin yang sama (misalnya internal seperti CSS/JS/HTML)
    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(request);
            })
        );
    } else {
        // Jika berasal dari luar origin (misal: API eksternal)
        event.respondWith(
            caches.open("product-cache").then(function (cache) {
                return fetch(event.request).then(function (liveResponse) {
                    cache.put(event.request, liveResponse.clone());
                    return liveResponse;
                }).catch(function () {
                    return caches.match(request).then(function (response) {
                        if (response) return response;

                        return caches.match("offline.json");

                    });
                }); // fallback kalau fetch gagal
            })
        );
    }
});


self.addEventListener('activate', event => {

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName !== CACHE_NAME;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
