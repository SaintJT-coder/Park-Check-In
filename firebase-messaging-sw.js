// Must live at the ROOT of your GitHub Pages site (same folder as index.html)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCLDsTUes-OL-CJV6uTzrHlvX70jUGuQuI",
  authDomain: "check-in-d31e8.firebaseapp.com",
  databaseURL: "https://check-in-d31e8-default-rtdb.firebaseio.com",
  projectId: "check-in-d31e8",
  storageBucket: "check-in-d31e8.firebasestorage.app",
  messagingSenderId: "378362756120",
  appId: "1:378362756120:web:e010fc076ad8323e03176d"
});

const messaging = firebase.messaging();

// Messages are sent data-only, so we display them ourselves (avoids duplicates)
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || "Court Check-In", {
    body: d.body || "",
    icon: d.icon || undefined,
    data: { url: d.url || "./" }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(clients.openWindow(url));
});
