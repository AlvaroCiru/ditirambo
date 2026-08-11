import { notFound } from "next/navigation";
import { CitaForm } from "@/components/citas/cita-form";
import { getCita } from "@/lib/queries-citas";

export default async function EditarCitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cita = await getCita(id);

  if (!cita) notFound();

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 md:max-w-xl">
      <h2 className="mb-4 font-heading text-xl">Editar cita</h2>
      <CitaForm cita={cita} />
    </div>
  );
}
