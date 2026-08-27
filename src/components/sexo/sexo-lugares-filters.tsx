"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEXO_TIPO_LABEL_SINGULAR, SEXO_TIPO_ORDER } from "@/lib/sexo-meta";

export function SexoLugaresFilters({
  q,
  sort,
  tipo,
}: {
  q: string;
  sort: string;
  tipo: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, start] = useTransition();

  function update(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "todos" || (k === "sort" && v === "recientes")) {
        if (k === "sort" && v === "recientes") params.delete("sort");
        else if (k !== "sort") params.delete(k);
        else params.set(k, v);
      } else {
        params.set(k, v);
      }
    }
    start(() => {
      router.push(`/sexo/lugares?${params.toString()}`);
    });
  }

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
        <label htmlFor="q" className="text-xs text-muted-foreground">
          Buscar
        </label>
        <Input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Nombre o localización…"
          onChange={(e) => {
            const value = e.target.value;
            window.clearTimeout((window as unknown as { __sexoQ?: number }).__sexoQ);
            (window as unknown as { __sexoQ?: number }).__sexoQ = window.setTimeout(
              () => update({ q: value }),
              350,
            );
          }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Orden</span>
        <Select value={sort || "recientes"} onValueChange={(v) => update({ sort: v ?? "recientes" })}>
          <SelectTrigger className="w-[10.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recientes">Más recientes</SelectItem>
            <SelectItem value="antiguos">Más antiguos</SelectItem>
            <SelectItem value="nombre">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">Tipo</span>
        <Select value={tipo || "todos"} onValueChange={(v) => update({ tipo: v ?? "todos" })}>
          <SelectTrigger className="w-[11rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {SEXO_TIPO_ORDER.map((t) => (
              <SelectItem key={t} value={t}>
                {SEXO_TIPO_LABEL_SINGULAR[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
