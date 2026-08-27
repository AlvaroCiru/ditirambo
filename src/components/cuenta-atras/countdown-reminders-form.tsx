"use client";

import { useActionState } from "react";
import {
  saveCountdownReminders,
  type CountdownFormState,
} from "@/lib/actions/countdown";
import type { CountdownTripReminder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initial: CountdownFormState = {};

export function CountdownRemindersForm({
  tripId,
  reminder,
}: {
  tripId: string;
  reminder: CountdownTripReminder | null;
}) {
  const [state, action, pending] = useActionState(
    saveCountdownReminders,
    initial,
  );

  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <input type="hidden" name="trip_id" value={tripId} />
      <div>
        <h3 className="font-heading text-lg">Avisos (opcionales)</h3>
        <p className="text-xs text-muted-foreground">
          Preferencias por usuario. El envío automático en esas fechas se
          activará más adelante.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        {(
          [
            ["remind_30d", "30 días", reminder?.remind_30d],
            ["remind_7d", "7 días", reminder?.remind_7d],
            ["remind_1d", "1 día", reminder?.remind_1d],
            ["remind_hoy", "Hoy", reminder?.remind_hoy],
          ] as const
        ).map(([name, label, checked]) => (
          <label key={name} className="flex items-center gap-2">
            <input
              type="checkbox"
              name={name}
              defaultChecked={Boolean(checked)}
              className="size-4 rounded border-border"
            />
            <Label className="font-normal">
              {label === "Hoy"
                ? "Recordarme el día del viaje"
                : `Recordarme cuando falten ${label}`}
            </Label>
          </label>
        ))}
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "Guardando…" : "Guardar avisos"}
      </Button>
    </form>
  );
}
