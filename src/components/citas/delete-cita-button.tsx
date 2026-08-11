"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCita } from "@/lib/actions/citas";
import { Button } from "@/components/ui/button";

export function DeleteCitaButton({ citaId }: { citaId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Borrar cita"
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Borrar esta cita?")) return;
        startTransition(() => deleteCita(citaId));
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
