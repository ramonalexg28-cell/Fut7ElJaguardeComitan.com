const CACHE = 'fut7-cache-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', 'https://cdn.jsdelivr.net/npm/chart.js', 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))) });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))) });