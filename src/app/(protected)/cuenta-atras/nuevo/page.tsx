import { CountdownTripForm } from "@/components/cuenta-atras/countdown-trip-form";
import { getUsedCountdownImages } from "@/lib/queries-countdown";

export default async function NuevoViajePage() {
  const usedImages = await getUsedCountdownImages();

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-xl">Viaje solo cuenta atrás</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Para viajes del planificador, usa una cita con categoría Viajes.
            Esto es opcional, solo countdown.
          </p>
          <CountdownTripForm usedImages={usedImages} />
    </div>
  );
}
