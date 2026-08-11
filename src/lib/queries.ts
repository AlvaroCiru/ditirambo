import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import { CATEGORY_ORDER, STATUS_ORDER } from "@/lib/categories";
import type { Review, Work, WorkStatus, WorkType } from "@/lib/types";

const WORK_LIST_COLUMNS =
  "id, tipo, titulo, autor_creador, anio, imagen_url, estado, creado_por, creado_en" as const;

const WORK_FEED_COLUMNS =
  "id, tipo, titulo, autor_creador, anio, imagen_url, estado, creado_por, creado_en" as const;

export interface WorksFilter {
  q?: string;
  tipo?: WorkType;
  estado?: WorkStatus;
}

export interface WorkListRating {
  userId: string;
  nota: number;
}

export interface WorkListItem extends Work {
  /** Notas por usuario (escala /10), sin promediar. */
  ratings: WorkListRating[];
}

export async function getWorks(filter: WorksFilter = {}): Promise<WorkListItem[]> {
  await getAuthedUser();
  const supabase = await createClient();

  let query = supabase
    .from("works")
    .select(`${WORK_LIST_COLUMNS}, reviews(user_id, nota)`)
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

  return (data ?? []).map((row) => {
    const { reviews, ...work } = row as Work & {
      reviews: { user_id: string; nota: number | string | null }[] | null;
    };
    const ratings: WorkListRating[] = (reviews ?? [])
      .map((r) => ({
        userId: r.user_id,
        nota: Number(r.nota),
      }))
      .filter((r) => Number.isFinite(r.nota));
    return { ...(work as Work), ratings };
  });
}

export async function getWork(id: string): Promise<Work | null> {
  await getAuthedUser();
  const supabase = await createClient();

  const { data: work, error } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return work;
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
    .select(`*, works(${WORK_FEED_COLUMNS})`)
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

  const [totalWorksResult, totalReviewsResult, ...filterResults] =
    await Promise.all([
      supabase.from("works").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      ...CATEGORY_ORDER.map((tipo) =>
        supabase
          .from("works")
          .select("id", { count: "exact", head: true })
          .eq("tipo", tipo),
      ),
      ...STATUS_ORDER.map((estado) =>
        supabase
          .from("works")
          .select("id", { count: "exact", head: true })
          .eq("estado", estado),
      ),
    ]);

  if (totalWorksResult.error) throw totalWorksResult.error;
  if (totalReviewsResult.error) throw totalReviewsResult.error;

  const categoryCounts = Object.fromEntries(
    CATEGORY_ORDER.map((tipo, index) => {
      const result = filterResults[index];
      if (result.error) throw result.error;
      return [tipo, result.count ?? 0];
    }),
  ) as Record<WorkType, number>;

  const statusCounts = Object.fromEntries(
    STATUS_ORDER.map((estado, index) => {
      const result = filterResults[CATEGORY_ORDER.length + index];
      if (result.error) throw result.error;
      return [estado, result.count ?? 0];
    }),
  ) as Record<WorkStatus, number>;

  return {
    totalWorks: totalWorksResult.count ?? 0,
    totalReviews: totalReviewsResult.count ?? 0,
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

  const { data: myReviews, error: myReviewsError } = await supabase
    .from("reviews")
    .select("work_id")
    .eq("user_id", user.id);

  if (myReviewsError) throw myReviewsError;

  const reviewedWorkIds = (myReviews ?? []).map((r) => r.work_id);

  let query = supabase
    .from("reviews")
    .select(`*, works(${WORK_FEED_COLUMNS})`)
    .eq("recomendado_para", user.id);

  if (reviewedWorkIds.length > 0) {
    query = query.not("work_id", "in", `(${reviewedWorkIds.join(",")})`);
  }

  const { data, error } = await query.returns<ReviewWithWork[]>();

  if (error) throw error;

  return (data ?? [])
    .filter((row): row is ReviewWithWork & { works: Work } => row.works !== null)
    .map(({ works, ...fromReview }) => ({ work: works, fromReview }));
}
