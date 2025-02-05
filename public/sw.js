const CACHE_VERSION = '0.6';
const picsumUrl = 'https://picsum.photos/200';

const appAssets = [
  '/',
  '/index.html',
  '/style.css',
  '/src/main.ts',
  '/vite.svg',
];

// SW Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(`static-${CACHE_VERSION}`)
      .then(cache => cache.addAll([]))
  );
});

// SW Activate, Eski cache'leri temizleme
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== `static-${CACHE_VERSION}`) // Sadece eski cache'leri filtrele
                .map((cacheName) => {
                    if (cacheName !== `static-${CACHE_VERSION}`) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


// Cache-first stratejisi
const staticCache = (req, cacheName = `static-${CACHE_VERSION}`) => {
    return caches.match(req).then((cacheResponse) => {
        // Return cached response if available
        if (cacheResponse) {
            return cacheResponse; // Cache'den yanıt döndür
        }
        // Return network response if it's available
        return fetch(req).then((networkResponse) => { // Ağdan yeni istek yap
            // Cache the network response
            return caches.open(cacheName)
                .then((cache) => {
                    // Update the cache with the new response
                    cache.put(req, networkResponse.clone());
                    return networkResponse;
                });
        });
    });
};

const fallbackCache = (req, cacheName = `static-${CACHE_VERSION}`) => {
    // Try to fetch from network
    return fetch(req).then((networkResponse) => {
        // Check res is OK, else go to cache
        if (!networkResponse.ok) {
            throw new Error('Network response was not ok');
        }
        // Update cache
        return caches.open(cacheName)
            .then((cache) => {
                // Update the cache with the new response
                cache.put(req, networkResponse.clone());
                return networkResponse;
            });
    }).catch(() => {
        // Fallback to cache
        return caches.match(req);
    });
};



self.addEventListener('fetch', (event) => {
    if (event.request.url.match(location.origin)) {
        event.respondWith(
            staticCache(event.request)
        );
        return;
    } else if (event.request.url.match(picsumUrl)) {
        event.respondWith(
            fallbackCache(event.request)
        );
        return;
    }

    /* if (!navigator.onLine) {
        // Register a sync event
        self.registration.sync.register('sync-data').then(() => {
            console.log('Sync event registered');
        }).catch(err => {
            console.error('Failed to register sync event:', err);
        });
    } */

    /* event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response; // Cache'den yanıt döndür
                }

                return fetch(event.request) // Ağdan yeni istek yap
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(`static-${CACHE_VERSION}`)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    ); */
});

// Background Sync Event Listener
self.addEventListener('sync', event => {
    console.log('Sync event triggered:', event);
    if (event.tag === 'send-data') {
        event.waitUntil(
            syncData()
        );
    }
});

// Sync Data Function
async function syncData() {
    console.log('İnternet geri geldi, senkronizasyon yapılıyor!');

    const cache = await caches.open('data-cache');
    const data = await cache.match('/pending-data');

    if (data) {
        console.log('Veri sunucuya gönderildi:', data);
        await cache.delete('/pending-data');
    } else {
        console.log('Veri sunucuya gönderilemedi.');
    }
}
