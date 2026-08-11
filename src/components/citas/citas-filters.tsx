"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CITA_CATEGORY_CONFIG,
  CITA_CATEGORY_ORDER,
  CITA_STATUS_LABELS,
  CITA_STATUS_ORDER,
} from "@/lib/cita-categories";
import { cn } from "@/lib/utils";

function hrefFor(params: URLSearchParams, key: string, value: string | null) {
  const next = new URLSearchParams(params.toString());
  if (!value || next.get(key) === value) {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  const qs = next.toString();
  return qs ? `/citas/lista?${qs}` : "/citas/lista";
}

export function CitasFilters() {
  const searchParams = useSearchParams();
  const estado = searchParams.get("estado");
  const categoria = searchParams.get("categoria");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {CITA_STATUS_ORDER.map((value) => {
          const active = estado === value;
          return (
            <Link
              key={value}
              href={hrefFor(searchParams, "estado", value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {CITA_STATUS_LABELS[value]}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {CITA_CATEGORY_ORDER.map((value) => {
          const active = categoria === value;
          return (
            <Link
              key={value}
              href={hrefFor(searchParams, "categoria", value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              style={active ? { color: `var(--cita-${value})` } : undefined}
            >
              {CITA_CATEGORY_CONFIG[value].label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
