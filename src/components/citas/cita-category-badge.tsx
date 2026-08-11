import { CITA_CATEGORY_CONFIG } from "@/lib/cita-categories";
import type { CitaCategoria } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CitaCategoryBadge({
  categoria,
  className,
}: {
  categoria: CitaCategoria;
  className?: string;
}) {
  const config = CITA_CATEGORY_CONFIG[categoria];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in oklch, var(--cita-${categoria}) 16%, var(--card))`,
        color: `var(--cita-${categoria})`,
      }}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}
