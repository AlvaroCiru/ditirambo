"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  formatRating,
  parseRating,
  ratingFillPercent,
  RATING_MAX,
  RATING_STEP,
  STAR_COUNT,
} from "@/lib/rating";

function StarGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-[1em] shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.27 6.2 20.37l1.11-6.47-4.7-4.58 6.49-.94L12 2.5z"
      />
    </svg>
  );
}

function StarsTrack({
  fillPercent,
  sizeClass,
  className,
}: {
  fillPercent: number;
  sizeClass: string;
  className?: string;
}) {
  const fill = Math.min(100, Math.max(0, fillPercent));
  const row = (tone: string, key: string) => (
    <span
      className={cn(
        "flex h-full w-[5.75em] items-center justify-between",
        tone,
      )}
    >
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <StarGlyph key={`${key}-${i}`} />
      ))}
    </span>
  );

  return (
    <span
      className={cn(
        "relative inline-block h-[1em] w-[5.75em] leading-none",
        sizeClass,
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-0">
        {row("text-muted-foreground/35", "empty")}
      </span>
      {fill > 0 && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill}%` }}
        >
          {row("text-accent", "full")}
        </span>
      )}
    </span>
  );
}

/** Solo lectura: 5 estrellas visuales a partir de nota /10. */
export function StarRating({
  value,
  size = "md",
  showValue = true,
  className,
}: {
  value: number | null | undefined;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}) {
  const n = parseRating(value);
  if (n == null) return null;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`${formatRating(n)}/${RATING_MAX}`}
    >
      <StarsTrack
        fillPercent={ratingFillPercent(n)}
        sizeClass={size === "sm" ? "text-sm" : "text-base"}
      />
      {showValue && (
        <span
          className={cn(
            "font-semibold tabular-nums text-accent",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {formatRating(n)}/{RATING_MAX}
        </span>
      )}
    </span>
  );
}

/** Entrada sobre 10; las estrellas son la representación visual. */
export function StarRatingInput({
  name,
  defaultValue,
  id,
}: {
  name: string;
  defaultValue?: number | null;
  id?: string;
}) {
  const initial = parseRating(defaultValue);
  const [value, setValue] = useState<number | null>(initial);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  const steps = Math.round(RATING_MAX / RATING_STEP);

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value ?? ""} id={id} />
      <div
        role="slider"
        aria-valuemin={RATING_STEP}
        aria-valuemax={RATING_MAX}
        aria-valuenow={value ?? undefined}
        aria-valuetext={
          value == null ? "Sin nota" : `${formatRating(value)} de ${RATING_MAX}`
        }
        aria-label="Nota"
        className="relative inline-flex w-fit touch-manipulation select-none"
        onMouseLeave={() => setHover(null)}
      >
        <StarsTrack
          fillPercent={ratingFillPercent(shown)}
          sizeClass="text-3xl sm:text-4xl"
        />
        <div className="absolute inset-0 flex">
          {Array.from({ length: steps }, (_, i) => {
            const stepValue = (i + 1) * RATING_STEP;
            return (
              <button
                key={stepValue}
                type="button"
                className="h-full flex-1 cursor-pointer border-0 bg-transparent p-0"
                aria-label={`${formatRating(stepValue)} de ${RATING_MAX}`}
                onMouseEnter={() => setHover(stepValue)}
                onFocus={() => setHover(stepValue)}
                onBlur={() => setHover(null)}
                onClick={() =>
                  setValue((current) =>
                    current === stepValue ? null : stepValue,
                  )
                }
              />
            );
          })}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {value == null ? (
          "Sin nota · pulsa las estrellas (medios puntos)"
        ) : (
          <>
            <span className="font-semibold text-accent">
              {formatRating(value)}
            </span>
            <span> / {RATING_MAX}</span>
            <span className="text-muted-foreground/80">
              {" "}
              · pulsa de nuevo para quitar
            </span>
          </>
        )}
      </p>
    </div>
  );
}
