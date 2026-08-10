/* Service worker mínimo: solo avisos. No cachea la app (evita interferir con Next). */

function resolveUrl(path) {
  try {
    return new URL(path || "/resenas", self.location.origin).href;
  } catch {
    return self.location.origin + "/resenas";
  }
}

self.addEventListener("push", (event) => {
  let payload = {
    title: "Ditirambo",
    body: "Hay novedades.",
    url: "/resenas",
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    // payload por defecto
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192",
      badge: "/icon-192",
      data: { url: resolveUrl(payload.url) },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = resolveUrl(event.notification.data?.url);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            client.navigate(target);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(target);
        }
      }),
  );
});
