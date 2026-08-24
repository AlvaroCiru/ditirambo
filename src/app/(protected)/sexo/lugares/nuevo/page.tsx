import { SexoLugarForm } from "@/components/sexo/sexo-lugar-form";

export default function NuevoLugarPage() {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 md:max-w-xl">
      <h2 className="mb-4 font-heading text-xl">Nuevo lugar</h2>
      <SexoLugarForm />
    </div>
  );
}
