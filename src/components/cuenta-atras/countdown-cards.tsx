import Image from "next/image";
import Link from "next/link";
import {
  countdownLabel,
  daysUntil,
  flagEmojiFromCountryCode,
  formatTripDateRange,
  tripProgress,
} from "@/lib/countdown-meta";
import type { CountdownItem } from "@/lib/queries-countdown";
import type { CountdownTrip } from "@/lib/types";
import { cn } from "@/lib/utils";

function itemTitle(item: Pick<CountdownItem, "nombre" | "pais_code" | "emoji">) {
  const flag = flagEmojiFromCountryCode(item.pais_code);
  const extra = item.emoji ? ` ${item.emoji}` : "";
  return `${item.nombre}${flag ? ` ${flag}` : ""}${extra}`;
}

export function CountdownHeroCard({ item }: { item: CountdownItem }) {
  const days = daysUntil(item.inicio_fecha);
  const label = countdownLabel(days);
  const isToday = days === 0;

  return (
    <Link
      href={item.href}
      className="group relative block overflow-hidden rounded-2xl border border-border"
    >
      <div className="relative aspect-[16/10] min-h-[280px] w-full bg-card sm:aspect-[21/9]">
        {item.imagen_url ? (
          <Image
            src={item.imagen_url}
            alt=""
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1f2a45] to-[#0f1524]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
          <p className="text-xs font-medium tracking-[0.2em] text-white/70">
            PRÓXIMO VIAJE
            {item.source === "cita" ? " · desde planificador" : ""}
          </p>
          <h2 className="mt-1 font-heading text-3xl text-white sm:text-4xl">
            {itemTitle(item)}
          </h2>
          <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
            {isToday ? (
              <p className="font-heading text-5xl text-white sm:text-6xl">
                HOY <span className="text-4xl">✈️</span>
              </p>
            ) : (
              <>
                <p className="font-heading text-5xl leading-none text-white sm:text-6xl">
                  {label.primary}
                </p>
                <p className="pb-1 text-lg text-white/80">{label.secondary}</p>
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-white/75">
            {formatTripDateRange(item.inicio_fecha, item.fin_fecha)}
          </p>
          {item.destino && (
            <p className="mt-1 text-sm text-white/60">{item.destino}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CountdownTripCard({
  item,
  size = "md",
}: {
  item: CountdownItem;
  size?: "md" | "sm";
}) {
  const days = daysUntil(item.inicio_fecha);
  const label = countdownLabel(days);
  const isToday = days === 0;
  const past = days < 0;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-border",
        size === "sm" ? "min-h-[140px]" : "min-h-[180px]",
      )}
    >
      <div className="relative h-full w-full">
        {item.imagen_url ? (
          <Image
            src={item.imagen_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#243454] to-[#121826]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-[1] flex h-full min-h-[inherit] flex-col justify-end p-4">
          <h3
            className={cn(
              "font-heading text-white",
              size === "sm" ? "text-lg" : "text-xl",
            )}
          >
            {itemTitle(item)}
          </h3>
          {!past && (
            <p className="mt-1 text-sm font-medium text-white/90">
              {isToday
                ? "HOY ✈️"
                : `${label.primary} ${label.secondary ?? ""}`}
            </p>
          )}
          <p className="mt-0.5 text-xs text-white/70">
            {formatTripDateRange(item.inicio_fecha, item.fin_fecha)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function CountdownProgress({ trip }: { trip: CountdownTrip | CountdownItem }) {
  const progress = tripProgress(trip.creado_en, trip.inicio_fecha);
  const pct = Math.round(progress * 100);
  const nombre = "nombre" in trip ? trip.nombre : "";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Viaje creado</span>
        <span>{nombre}</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/80"
          style={{ width: `${pct}%` }}
        />
        <span
          className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>
    </div>
  );
}
