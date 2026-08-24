import { SexoCasaForm } from "@/components/sexo/sexo-casa-form";
import { getSexoSettings } from "@/lib/queries-sexo";

export default async function SexoAjustesPage() {
  const settings = await getSexoSettings();

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-2 font-heading text-xl">Casa</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Punto de referencia compartido para las distancias. Por defecto está
        entre Sanchinarro y La Moraleja.
      </p>
      <SexoCasaForm
        initialLat={settings.casa_lat}
        initialLng={settings.casa_lng}
      />
    </div>
  );
}
