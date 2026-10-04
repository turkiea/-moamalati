const CACHE='moamalati-local-v14';
const APP=[
  './',
  './index.html',
  './manifest.webmanifest',
  './app-icon-180-v12.png',
  './app-icon-512-v12.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;

  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).then(resp=>{
        const cp=resp.clone();
        caches.open(CACHE).then(c=>c.put('./index.html',cp)).catch(()=>{});
        return resp;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached=>{
      return cached || fetch(e.request).then(resp=>{
        const cp=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
        return resp;
      });
    })
  );
});
