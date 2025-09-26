export function registerSW() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/sw-clean.js"
        );
        console.log("ServiceWorker registration successful");
        console.log(registration);
      } catch (err) {
        console.log("ServiceWorker registration failed: ", err);
      }
    });
  }
}

export function unregisterSW() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}
