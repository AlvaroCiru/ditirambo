import { notFound } from "next/navigation";
import { CountdownTripForm } from "@/components/cuenta-atras/countdown-trip-form";
import {
  getCountdownTrip,
  getUsedCountdownImages,
} from "@/lib/queries-countdown";

export default async function EditarViajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [trip, usedImages] = await Promise.all([
    getCountdownTrip(id),
    getUsedCountdownImages(),
  ]);
  if (!trip) notFound();

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 font-heading text-xl">Editar viaje</h2>
      <CountdownTripForm trip={trip} usedImages={usedImages} />
    </div>
  );
}
