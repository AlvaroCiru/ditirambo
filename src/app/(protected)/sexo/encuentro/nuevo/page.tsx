import { SexoEncuentroForm } from "@/components/sexo/sexo-encuentro-form";
import { getSexoLugares } from "@/lib/queries-sexo";

export default async function NuevoEncuentroPage() {
  const lugares = await getSexoLugares();

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 md:max-w-xl">
      <h2 className="mb-4 font-heading text-xl">Añadir encuentro</h2>
      <SexoEncuentroForm lugares={lugares} />
    </div>
  );
}
