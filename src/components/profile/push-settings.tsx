"use client";

import { useState, useTransition } from "react";
import {
  removePushSubscription,
  savePushSubscription,
  sendTestAviso,
  type PushSettingsState,
} from "@/lib/actions/push";
import {
  canUseAvisosWeb,
  ensurePushSubscription,
  unsubscribePush,
} from "@/lib/push/client";
import { Button } from "@/components/ui/button";

export function PushSettings({ initial }: { initial: PushSettingsState }) {
  const [hasSubscription, setHasSubscription] = useState(
    initial.hasSubscription,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!initial.configured) {
    return (
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg">Avisos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Los avisos no están activos en este entorno. Se pueden encender con la
          variable de configuración correspondiente, o apagar sin quitar el
          resto de la aplicación.
        </p>
      </section>
    );
  }

  const supported = canUseAvisosWeb();

  function activate() {
    if (!initial.vapidPublicKey) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const sub = await ensurePushSubscription(initial.vapidPublicKey!);
        if (!sub) {
          setMessage(
            "No se ha podido activar. En el iPhone hace falta haber añadido Ditirambo a la pantalla de inicio y aceptar el permiso.",
          );
          return;
        }
        const result = await savePushSubscription({
          ...sub,
          userAgent: navigator.userAgent,
        });
        if (result.error) {
          setMessage(result.error);
          return;
        }
        setHasSubscription(true);
        setMessage("Avisos activados en este aparato.");
      } catch {
        setMessage("No se ha podido activar los avisos en este aparato.");
      }
    });
  }

  function deactivate() {
    setMessage(null);
    startTransition(async () => {
      try {
        const endpoint = await unsubscribePush();
        const result = await removePushSubscription(endpoint);
        if (result.error) {
          setMessage(result.error);
          return;
        }
        setHasSubscription(false);
        setMessage("Avisos desactivados en este aparato.");
      } catch {
        setMessage("No se ha podido desactivar los avisos.");
      }
    });
  }

  function test() {
    setMessage(null);
    startTransition(async () => {
      const result = await sendTestAviso();
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Se ha enviado un aviso de prueba a este aparato.");
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-lg">Avisos</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Recibe un aviso cuando la otra persona deje una reseña o te recomiende
        una obra. En el iPhone solo funciona si Ditirambo está añadido a la
        pantalla de inicio.
      </p>

      {!supported && (
        <p className="mt-3 text-sm text-destructive">
          Este navegador no admite avisos web.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!hasSubscription ? (
          <Button
            type="button"
            disabled={!supported || pending}
            onClick={activate}
          >
            {pending ? "Activando…" : "Activar avisos"}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={test}
            >
              Enviar prueba
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={deactivate}
            >
              Desactivar
            </Button>
          </>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
