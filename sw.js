/* ===================================================================
   Service Worker — QRoX Mobile
   ⚠️ Đổi CACHE version mỗi khi sửa index.html / sw.js để force reload
   =================================================================== */

const CACHE = 'qrox-v16';

const CORE = [
  './',
  './index.html',
  './manifest.json',
  './qrcode.min.js',
  './html5-qrcode.min.js',
  './banks.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE).catch(err =>
        console.warn('Cache một số file lỗi:', err)
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  if (e.request.url.includes('api.vietqr.io')){
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
