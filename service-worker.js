const CACHE_NAME = "corewave-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/icon.png",
  "/samples/C4.mp3",
  "/samples/Ds4.mp3",
  "/samples/Fs4.mp3",
  "/samples/A4.mp3",
  "/manifest.json", // Add the manifest file
  "/service-worker.js",
  "/Tone.min.js",
  "/vexflow-min.js",

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
