import { notFound } from "next/navigation";
import { getWorkWithReviews } from "@/lib/queries";
import { WorkForm } from "@/components/works/work-form";

export default async function EditarObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getWorkWithReviews(id);

  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Editar obra</h1>
      <div className="max-w-md rounded-xl border border-border bg-card p-6">
        <WorkForm work={data.work} />
      </div>
    </div>
  );
}
