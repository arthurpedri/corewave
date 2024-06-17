const CACHE_NAME = "corewave-cache-v2";
const urlsToCache = [
  "/corewave/",
  "/corewave/index.html",
  "/corewave/styles.css",
  "/corewave/script.js",
  "/corewave/icon.png",
  "/corewave/samples/C4.mp3",
  "/corewave/samples/Ds4.mp3",
  "/corewave/samples/Fs4.mp3",
  "/corewave/samples/A4.mp3",
  "/corewave/manifest.json", // Add the manifest file
  "/corewave/service-worker.js",
  "/corewave/Tone.min.js",
  "/corewave/vexflow-min.js",

  // Add other resources you want to cache
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Return the cached resource
      }
      return fetch(event.request); // Fetch from the network
    })
  );
});
