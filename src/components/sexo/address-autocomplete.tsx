"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchAddresses, type GeocodeResult } from "@/lib/geocode-nominatim";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AddressAutocomplete({
  name = "ubicacion_texto",
  label = "Ubicación",
  placeholder = "Busca una dirección…",
  defaultValue = "",
  onSelect,
  className,
}: {
  name?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onSelect?: (result: GeocodeResult) => void;
  className?: string;
}) {
  const listId = useId();
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const handle = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      void searchAddresses(query, controller.signal)
        .then((items) => {
          setResults(items);
          setOpen(true);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setError("No se ha podido buscar. Prueba de nuevo.");
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 450);

    return () => {
      window.clearTimeout(handle);
      abortRef.current?.abort();
    };
  }, [query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className={cn("relative flex flex-col gap-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        value={query}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
      />
      {loading && (
        <p className="text-xs text-muted-foreground">Buscando…</p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                className="w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => {
                  setQuery(item.label);
                  setOpen(false);
                  setResults([]);
                  onSelect?.(item);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        Elige una sugerencia para fijar el punto en el mapa y rellenar ciudad,
        provincia y país.
      </p>
    </div>
  );
}
