import { CATEGORY_CONFIG } from "@/lib/categories";
import type { WorkType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  tipo,
  className,
}: {
  tipo: WorkType;
  className?: string;
}) {
  const config = CATEGORY_CONFIG[tipo];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in oklch, var(--category-${tipo}) 16%, var(--card))`,
        color: `var(--category-${tipo})`,
      }}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}
