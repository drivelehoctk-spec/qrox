/* ===================================================================
   Service Worker — QRoX Mobile
   ⚠️ Đổi CACHE version mỗi khi sửa index.html / sw.js để force reload
   =================================================================== */

const CACHE = 'qrox-v11';   // ⚠️ ĐÃ ĐỔI từ v10 → v11 (do thêm tính năng Share)

const CORE = [
  './',
  './index.html',
  './manifest.json',
  './qrcode.min.js',
  './html5-qrcode.min.js',
  './banks.json'
];

/* Install: cache toàn bộ file core */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE).catch(err =>
        console.warn('Cache một số file lỗi:', err)
      ))
      .then(() => self.skipWaiting())
  );
});

/* Activate: xoá cache cũ không còn dùng */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* Fetch: cache-first, fallback network */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // API VietQR — luôn fetch mới, không cache (cần dữ liệu tươi)
  if (e.request.url.includes('api.vietqr.io')){
    return;   // Để browser tự xử lý, không qua Service Worker
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(res => {
        // Chỉ cache response OK, cùng origin
        if (res.ok && e.request.url.startsWith(self.location.origin)){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
