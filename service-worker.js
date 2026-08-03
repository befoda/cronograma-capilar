var CACHE = "cronograma-capilar-v4";
var ARQUIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(
        ARQUIVOS.map(function (arquivo) {
          return cache.add(new Request(arquivo, { cache: "reload" }));
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE; })
            .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

function ehDinamico(url) {
  return url.origin === self.location.origin && /\.(html|css|js)$/.test(url.pathname);
}

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);

  if (event.request.mode === "navigate" || ehDinamico(url)) {
    event.respondWith(
      fetch(event.request, { cache: "reload" }).then(function (resposta) {
        var copia = resposta.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(event.request, copia);
        });
        return resposta;
      }).catch(function () {
        return caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (resposta) {
      return resposta || fetch(event.request);
    })
  );
});
