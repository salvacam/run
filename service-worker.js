var cacheName = 'horarios-v1.1.07';

var filesToCache = []
/*
  './',
  './index.html',
  './js/main.min.js',
  './css/style.min.css',

  './fonts/fontawesome-webfont.woff2?v=4.7.0',
  './fonts/fontawesome-webfont.woff?v=4.7.0',
  './fonts/fontawesome-webfont.ttf?v=4.7.0',
  './fonts/fontawesome-webfont.svg?v=4.7.0',
  './fonts/fontawesome-webfont.eot?v=4.7.0',

  './fonts/FontAwesome.otf',
  './fonts/fontawesome-webfont.eot',
  './fonts/fontawesome-webfont.svg',
  './fonts/fontawesome-webfont.ttf',
  './fonts/fontawesome-webfont.woff',
  './fonts/fontawesome-webfont.woff2',
  
  './img/icon.png'
];
*/
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install_');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate_');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key.startsWith('horarios-')){
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }
      }));
    })
  );
});
/*
self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response){
      if(response)
        return response;
      return fetch(event.request).then(function(response){
        return response;
      });
  }));
});
*/
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});
/*
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
});
*/
/*
self.addEventListener('notificationclose', function(event) {
  
});
*/
/*
self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
*/
