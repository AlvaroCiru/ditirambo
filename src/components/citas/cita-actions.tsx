"use client";

import { useTransition } from "react";
import {
  acceptCita,
  markCitaFinalizada,
  rejectCita,
} from "@/lib/actions/citas";
import { Button } from "@/components/ui/button";

export function CitaAcceptRejectButtons({ citaId }: { citaId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => acceptCita(citaId))}
      >
        Aceptar
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (!confirm("¿Rechazar esta propuesta?")) return;
          startTransition(() => rejectCita(citaId));
        }}
      >
        Rechazar
      </Button>
    </div>
  );
}

export function CitaFinalizeButton({ citaId }: { citaId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Marcar esta cita como finalizada?")) return;
        startTransition(() => markCitaFinalizada(citaId));
      }}
    >
      Marcar finalizada
    </Button>
  );
}
