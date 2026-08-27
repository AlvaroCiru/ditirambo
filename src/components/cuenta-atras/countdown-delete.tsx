"use client";

import { useTransition } from "react";
import { deleteCountdownTrip } from "@/lib/actions/countdown";
import { Button } from "@/components/ui/button";

export function CountdownDeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className="text-destructive"
      onClick={() => {
        if (!window.confirm("¿Eliminar este viaje?")) return;
        start(() => {
          void deleteCountdownTrip(id);
        });
      }}
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </Button>
  );
}
