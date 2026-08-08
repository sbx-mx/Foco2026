const CACHE_NAME = 'foco-2026-python-engine-v9';
const APP_SHELL = [
  './','./index.html','./style.css','./slicers.js','./app.js','./data.js','./manifest.webmanifest','./favicon.ico',
  './assets/icons/icon-72.png','./assets/icons/icon-96.png','./assets/icons/icon-128.png','./assets/icons/icon-144.png',
  './assets/icons/icon-152.png','./assets/icons/icon-180.png','./assets/icons/icon-192.png','./assets/icons/icon-384.png',
  './assets/icons/icon-512.png','./assets/icons/icon-maskable-192.png','./assets/icons/icon-maskable-512.png','./assets/splash-1920x1080.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.allSettled(APP_SHELL.map(url=>cache.add(url)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const isData=new URL(event.request.url).pathname.endsWith('/data.js');
  if(event.request.mode==='navigate'||isData){
    event.respondWith(fetch(event.request).then(response=>{
      const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;
    }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;
  })));
});
