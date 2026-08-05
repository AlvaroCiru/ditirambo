"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/lib/categories";
import { cn } from "@/lib/utils";

export function WorksFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const activeTipo = searchParams.get("tipo");
  const activeEstado = searchParams.get("estado");

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateParams({ q: q || null });
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar por título o autor…"
          className="pl-9"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeTipo ? "outline" : "secondary"}
          size="sm"
          onClick={() => updateParams({ tipo: null })}
        >
          Todas
        </Button>
        {CATEGORY_ORDER.map((tipo) => {
          const config = CATEGORY_CONFIG[tipo];
          const Icon = config.icon;
          const active = activeTipo === tipo;
          return (
            <Button
              key={tipo}
              type="button"
              variant={active ? "secondary" : "outline"}
              size="sm"
              onClick={() => updateParams({ tipo: active ? null : tipo })}
              className={cn("gap-1.5", active && "border-current")}
              style={active ? { color: `var(--category-${tipo})` } : undefined}
            >
              <Icon className="size-3.5" />
              {config.labelPlural}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeEstado ? "outline" : "secondary"}
          size="sm"
          onClick={() => updateParams({ estado: null })}
        >
          Cualquier estado
        </Button>
        {STATUS_ORDER.map((estado) => {
          const active = activeEstado === estado;
          return (
            <Button
              key={estado}
              type="button"
              variant={active ? "secondary" : "outline"}
              size="sm"
              onClick={() => updateParams({ estado: active ? null : estado })}
            >
              {STATUS_LABELS[estado]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
