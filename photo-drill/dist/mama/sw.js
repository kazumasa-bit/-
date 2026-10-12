const C='mama-1465dbfdb7';const F=["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-512.png", "photos/common/camera-grid.jpg", "photos/common/compose-off.jpg", "photos/common/compose-on.jpg", "photos/common/settings-icon.jpg"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
