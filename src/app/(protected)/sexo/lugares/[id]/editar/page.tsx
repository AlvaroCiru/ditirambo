import { notFound } from "next/navigation";
import { SexoLugarForm } from "@/components/sexo/sexo-lugar-form";
import { getSexoLugar } from "@/lib/queries-sexo";

export default async function SexoLugarEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lugar = await getSexoLugar(id);
  if (!lugar) notFound();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <h2 className="font-heading text-2xl">Editar lugar</h2>
      <SexoLugarForm lugar={lugar} />
    </div>
  );
}
