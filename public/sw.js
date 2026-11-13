const CACHE = "peace-home-v2-public";
const PRECACHE = ["/", "/properties", "/manifest.webmanifest", "/brand/logo.jpg", "/icons/icon-192.png"];

function isPrivateRequest(url) {
  const path = url.pathname;
  return (
    path.startsWith("/api/") ||
    path.startsWith("/account") ||
    path.startsWith("/messages") ||
    path.startsWith("/owner") ||
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/favorites") ||
    path.startsWith("/apply")
  );
}

function isCacheableAsset(url) {
  if (url.origin !== self.location.origin) return false;
  if (isPrivateRequest(url)) return false;
  // Static files and public marketing pages only.
  return (
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/properties/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Never cache authenticated or private routes — always network.
  if (isPrivateRequest(url) || request.credentials === "include") {
    event.respondWith(fetch(request));
    return;
  }

  // Public static assets: cache-first.
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // Everything else (HTML shells, etc.): network-first, do not store personalized responses.
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  );
});
