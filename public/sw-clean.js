const CACHE_NAME = "bistro-admin-v1";
const DYNAMIC_CACHE_NAME = "dynamic-cache-v1";

// URLs para cache estático
const STATIC_ASSETS = ["/", "/dashboard"];

// Install event - cache recursos estáticos
self.addEventListener("install", function (event) {
  console.log("[SW] Install", event);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Forçar atualização
        return self.skipWaiting();
      })
  );
});

// Activate event - limpeza de cache antigo
self.addEventListener("activate", function (event) {
  console.log("[SW] Activate", event);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Ativar imediatamente
        return self.clients.claim();
      })
  );
});

// Fetch event - estratégias de cache
self.addEventListener("fetch", function (event) {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégias baseadas no tipo de recurso
  if (request.destination === "document") {
    // Páginas HTML: Network First, fallback para cache
    event.respondWith(
      networkFirstWithCacheFallback(request, DYNAMIC_CACHE_NAME)
    );
  } else if (
    request.destination === "image" ||
    /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url.pathname)
  ) {
    // Imagens: Cache First
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
  } else if (url.pathname.startsWith("/api/")) {
    // APIs: sempre rede, cache para fallback
    event.respondWith(
      networkFirstWithCacheFallback(request, DYNAMIC_CACHE_NAME)
    );
  } else {
    // Outros assets estáticos: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
  }
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  try {
    // Primeiro, busca no cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Se não está no cache, busca na rede
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cacheia para próxima vez
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Cache first failed:", error);
    // Retorna página offline se disponível
    return (
      caches.match("/offline") ||
      new Response("Aplicação offline", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/html" },
      })
    );
  }
}

// Network First with Cache Fallback
async function networkFirstWithCacheFallback(request, cacheName) {
  try {
    // Tentar rede primeiro
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cacheia a resposta
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Se rede falha, usa cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Se também não está no cache, retorna página offline
    return new Response(`Página indisponível: ${error.message}`, {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/html" },
    });
  }
}

// Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Busca nova versão em background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      console.log("[SW] Background refresh failed");
    });

  // Retorna cache imediatamente
  return cachedResponse ? cachedResponse : fetchPromise;
}
