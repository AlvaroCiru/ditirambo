import type { DashboardStats } from "@/lib/queries";

export function StatsGrid({
  stats,
  pendingCount,
}: {
  stats: DashboardStats;
  pendingCount: number;
}) {
  const items = [
    { label: "Obras en la colección", value: stats.totalWorks },
    { label: "Reseñas escritas", value: stats.totalReviews },
    { label: "Recomendaciones pendientes", value: pendingCount },
    { label: "Completadas", value: stats.statusCounts.completado },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
