import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/lib/categories";
import type { WorkType } from "@/lib/types";

export function CategoryBreakdown({
  counts,
}: {
  counts: Record<WorkType, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_ORDER.map((tipo) => {
        const config = CATEGORY_CONFIG[tipo];
        const Icon = config.icon;

        return (
          <div
            key={tipo}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
            style={{
              backgroundColor: `color-mix(in oklch, var(--category-${tipo}) 14%, var(--card))`,
            }}
          >
            <Icon
              className="size-4 shrink-0"
              style={{ color: `var(--category-${tipo})` }}
            />
            <span className="text-foreground">{config.labelPlural}</span>
            <span className="font-semibold text-foreground">
              {counts[tipo]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
