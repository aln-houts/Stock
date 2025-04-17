self.addEventListener("install", (e) => {
  console.log("Service Worker installed");
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("fetch", (e) => {
  // Basic fetch fallback (add caching logic if needed)
});
