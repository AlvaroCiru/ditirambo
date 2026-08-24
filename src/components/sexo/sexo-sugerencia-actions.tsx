"use client";

import { useTransition } from "react";
import {
  acceptSexoSugerencia,
  rejectSexoSugerencia,
} from "@/lib/actions/sexo";
import { Button } from "@/components/ui/button";

export function SexoSugerenciaActions({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => start(() => acceptSexoSugerencia(id))}
      >
        Aceptar
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (!confirm("¿Rechazar esta sugerencia?")) return;
          start(() => rejectSexoSugerencia(id));
        }}
      >
        Rechazar
      </Button>
    </div>
  );
}
