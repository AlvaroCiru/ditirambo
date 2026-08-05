import Link from "next/link";
import {
  getDashboardStats,
  getPendingRecommendations,
  getRecentActivity,
} from "@/lib/queries";
import { getProfiles } from "@/lib/dal";
import { ActivityItem } from "@/components/works/activity-item";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { PendingRecommendations } from "@/components/dashboard/pending-recommendations";

export default async function FeedPage() {
  const [activity, profiles, stats, pending] = await Promise.all([
    getRecentActivity(),
    getProfiles(),
    getDashboardStats(),
    getPendingRecommendations(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl">Inicio</h1>
        <p className="text-sm text-muted-foreground">
          Un vistazo a vuestra colección compartida.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <StatsGrid stats={stats} pendingCount={pending.length} />
        <CategoryBreakdown counts={stats.categoryCounts} />
      </div>

      <PendingRecommendations items={pending} profiles={profiles} />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl">Actividad reciente</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay reseñas.{" "}
            <Link href="/obras/nueva" className="underline">
              Añade la primera obra
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {activity.map((item) => (
              <ActivityItem
                key={item.review.id}
                item={item}
                profiles={profiles}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
