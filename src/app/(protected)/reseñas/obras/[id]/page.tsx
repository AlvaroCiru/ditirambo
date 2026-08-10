import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getWorkWithReviews } from "@/lib/queries";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { CategoryBadge } from "@/components/works/category-badge";
import { ReviewForm } from "@/components/works/review-form";
import { ReviewList } from "@/components/works/review-list";
import { StatusSelect } from "@/components/works/status-select";
import { DeleteWorkButton } from "@/components/works/delete-work-button";
import { Button } from "@/components/ui/button";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, user, profiles] = await Promise.all([
    getWorkWithReviews(id),
    getAuthedUser(),
    getProfiles(),
  ]);

  if (!data) notFound();

  const { work, reviews } = data;
  const myReview = reviews.find((r) => r.user_id === user.id) ?? null;
  const partner = profiles.find((p) => p.id !== user.id) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
        style={{
          borderTopColor: `var(--category-${work.tipo})`,
          borderTopWidth: 4,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <CategoryBadge tipo={work.tipo} />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Editar obra"
              nativeButton={false}
              render={
                <Link href={`/reseñas/obras/${work.id}/editar`}>
                  <Pencil className="size-4" />
                </Link>
              }
            />
            <DeleteWorkButton workId={work.id} />
          </div>
        </div>
        {work.imagen_url && (
          <div className="relative flex h-80 max-h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-background">
            <Image
              src={work.imagen_url}
              alt=""
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-contain"
              priority
            />
          </div>
        )}
        <h1 className="break-words font-heading text-3xl">{work.titulo}</h1>
        {(work.autor_creador || work.anio) && (
          <p className="text-muted-foreground">
            {[work.autor_creador, work.anio].filter(Boolean).join(" · ")}
          </p>
        )}
        <StatusSelect workId={work.id} estado={work.estado} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl">Reseñas</h2>
        <ReviewList workId={work.id} reviews={reviews} profiles={profiles} />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-xl">
          {myReview ? "Tu reseña" : "Añade tu reseña"}
        </h2>
        <ReviewForm
          key={myReview?.actualizado_en ?? "new"}
          workId={work.id}
          partnerId={partner?.id ?? null}
          existingReview={myReview}
        />
      </section>
    </div>
  );
}
