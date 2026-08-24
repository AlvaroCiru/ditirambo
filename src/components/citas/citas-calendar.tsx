"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildMonthGrid,
  citaTouchesDay,
  dayKey,
} from "@/lib/cita-datetime";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Cita } from "@/lib/types";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CitasCalendar({ citas }: { citas: Cita[] }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const todayKey = dayKey(today);

  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(cursor);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl capitalize">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Mes anterior"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
            }
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Mes siguiente"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="grid min-w-[42rem] grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid min-w-[42rem] grid-cols-7">
          {cells.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-24 border-b border-r border-border/60 bg-background/40 p-1.5 last:border-r-0"
                />
              );
            }

            const key = dayKey(date);
            const isToday = key === todayKey;
            const dayCitas = citas.filter((cita) =>
              citaTouchesDay(cita.inicio_en, cita.fin_en, date),
            );

            return (
              <div
                key={key}
                className={cn(
                  "min-h-24 border-b border-r border-border/60 p-1.5 last:border-r-0",
                  isToday && "bg-secondary/40",
                )}
              >
                <div
                  className={cn(
                    "mb-1 flex size-7 items-center justify-center rounded-full text-xs",
                    isToday
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {date.getDate()}
                </div>
                <div className="flex flex-col gap-0.5">
                  {dayCitas.slice(0, 3).map((cita) => {
                    const past = cita.estado === "finalizada";
                    return (
                      <Link
                        key={cita.id}
                        href={`/citas/${cita.id}`}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[11px] leading-tight hover:opacity-90",
                          past
                            ? "text-muted-foreground line-through decoration-muted-foreground/50"
                            : "text-foreground",
                        )}
                        style={{
                          backgroundColor: past
                            ? `color-mix(in oklch, var(--cita-${cita.categoria}) 12%, var(--card))`
                            : `color-mix(in oklch, var(--cita-${cita.categoria}) 28%, var(--card))`,
                        }}
                        title={`${cita.titulo}${past ? " (finalizada)" : ""}`}
                      >
                        {cita.titulo}
                      </Link>
                    );
                  })}
                  {dayCitas.length > 3 && (
                    <span className="px-1 text-[10px] text-muted-foreground">
                      +{dayCitas.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
