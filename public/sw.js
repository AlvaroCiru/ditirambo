/* Service worker mínimo: solo avisos. No cachea la app (evita interferir con Next). */

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
      data: { url: payload.url || "/resenas" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/resenas";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
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
