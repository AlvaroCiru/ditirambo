"use client";

import { useTransition } from "react";
import { deleteSexoLugar } from "@/lib/actions/sexo";
import { Button } from "@/components/ui/button";

export function SexoLugarDeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className="text-destructive"
      onClick={() => {
        if (
          !window.confirm(
            "¿Eliminar este lugar? No se puede deshacer.",
          )
        ) {
          return;
        }
        start(() => {
          void deleteSexoLugar(id);
        });
      }}
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </Button>
  );
}
