import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import { CATEGORY_ORDER, STATUS_ORDER } from "@/lib/categories";
import type { Review, Work, WorkStatus, WorkType } from "@/lib/types";

export interface WorksFilter {
  q?: string;
  tipo?: WorkType;
  estado?: WorkStatus;
}

export async function getWorks(filter: WorksFilter = {}): Promise<Work[]> {
  await getAuthedUser();
  const supabase = await createClient();

  let query = supabase
    .from("works")
    .select("*")
    .order("creado_en", { ascending: false });

  if (filter.tipo) query = query.eq("tipo", filter.tipo);
  if (filter.estado) query = query.eq("estado", filter.estado);
  if (filter.q) {
    query = query.textSearch("search", filter.q, {
      type: "websearch",
      config: "simple",
    });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getWorkWithReviews(
  id: string,
): Promise<{ work: Work; reviews: Review[] } | null> {
  await getAuthedUser();
  const supabase = await createClient();

  const { data: work, error: workError } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (workError) throw workError;
  if (!work) return null;

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("*")
    .eq("work_id", id)
    .order("creado_en", { ascending: true });

  if (reviewsError) throw reviewsError;

  return { work, reviews: reviews ?? [] };
}

export interface FeedItem {
  review: Review;
  work: Work;
}

interface ReviewWithWork extends Review {
  works: Work | null;
}

export async function getRecentActivity(limit = 20): Promise<FeedItem[]> {
  await getAuthedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, works(*)")
    .order("creado_en", { ascending: false })
    .limit(limit)
    .returns<ReviewWithWork[]>();

  if (error) throw error;

  return (data ?? [])
    .filter((row): row is ReviewWithWork & { works: Work } => row.works !== null)
    .map(({ works, ...review }) => ({ review, work: works }));
}

export interface DashboardStats {
  totalWorks: number;
  totalReviews: number;
  categoryCounts: Record<WorkType, number>;
  statusCounts: Record<WorkStatus, number>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await getAuthedUser();
  const supabase = await createClient();

  const [worksResult, reviewsResult] = await Promise.all([
    supabase.from("works").select("tipo, estado"),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
  ]);

  if (worksResult.error) throw worksResult.error;
  if (reviewsResult.error) throw reviewsResult.error;

  const categoryCounts = Object.fromEntries(
    CATEGORY_ORDER.map((tipo) => [tipo, 0]),
  ) as Record<WorkType, number>;
  const statusCounts = Object.fromEntries(
    STATUS_ORDER.map((estado) => [estado, 0]),
  ) as Record<WorkStatus, number>;

  const works = worksResult.data ?? [];
  for (const work of works) {
    categoryCounts[work.tipo as WorkType] += 1;
    statusCounts[work.estado as WorkStatus] += 1;
  }

  return {
    totalWorks: works.length,
    totalReviews: reviewsResult.count ?? 0,
    categoryCounts,
    statusCounts,
  };
}

export interface PendingRecommendation {
  work: Work;
  fromReview: Review;
}

/** Obras que la pareja te ha recomendado y que todavía no has reseñado tú. */
export async function getPendingRecommendations(): Promise<
  PendingRecommendation[]
> {
  const user = await getAuthedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, works(*)")
    .eq("recomendado_para", user.id)
    .returns<ReviewWithWork[]>();

  if (error) throw error;

  const candidates = (data ?? []).filter(
    (row): row is ReviewWithWork & { works: Work } => row.works !== null,
  );

  if (candidates.length === 0) return [];

  const { data: myReviews, error: myReviewsError } = await supabase
    .from("reviews")
    .select("work_id")
    .eq("user_id", user.id);

  if (myReviewsError) throw myReviewsError;

  const reviewedWorkIds = new Set((myReviews ?? []).map((r) => r.work_id));

  return candidates
    .filter((row) => !reviewedWorkIds.has(row.work_id))
    .map(({ works, ...fromReview }) => ({ work: works, fromReview }));
}
