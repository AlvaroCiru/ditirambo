import { WorkForm } from "@/components/works/work-form";

export default function NuevaObraPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Añadir obra</h1>
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 md:max-w-xl">
        <WorkForm />
      </div>
    </div>
  );
}
