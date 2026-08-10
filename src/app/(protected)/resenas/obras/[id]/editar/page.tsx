import { notFound } from "next/navigation";
import { getWork } from "@/lib/queries";
import { WorkForm } from "@/components/works/work-form";

export default async function EditarObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getWork(id);

  if (!work) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Editar obra</h1>
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 md:max-w-xl">
        <WorkForm work={work} />
      </div>
    </div>
  );
}
