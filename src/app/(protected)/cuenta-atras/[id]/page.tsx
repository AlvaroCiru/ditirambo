import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  CountdownProgress,
} from "@/components/cuenta-atras/countdown-cards";
import { CountdownDeleteButton } from "@/components/cuenta-atras/countdown-delete";
import { CountdownRemindersForm } from "@/components/cuenta-atras/countdown-reminders-form";
import { Button } from "@/components/ui/button";
import {
  countdownLabel,
  daysUntil,
  detailedCountdown,
  flagEmojiFromCountryCode,
  formatTripDateRange,
} from "@/lib/countdown-meta";
import {
  getCountdownTrip,
  getMyTripReminders,
} from "@/lib/queries-countdown";

export default async function CuentaAtrasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [trip, reminder] = await Promise.all([
    getCountdownTrip(id),
    getMyTripReminders(id),
  ]);
  if (!trip) notFound();

  const days = daysUntil(trip.inicio_fecha);
  const label = countdownLabel(days);
  const flag = flagEmojiFromCountryCode(trip.pais_code);
  const detailed = detailedCountdown(trip.inicio_fecha, trip.inicio_hora);
  const upcoming = days >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative aspect-[16/9] w-full bg-background">
          {trip.imagen_url ? (
            <Image
              src={trip.imagen_url}
              alt=""
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1f2a45] to-[#0f1524]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <h2 className="font-heading text-3xl text-white sm:text-4xl">
              {trip.nombre}
              {flag ? ` ${flag}` : ""}
              {trip.emoji ? ` ${trip.emoji}` : ""}
            </h2>
            {trip.destino && (
              <p className="mt-1 text-sm text-white/75">{trip.destino}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          {upcoming ? (
            days === 0 ? (
              <p className="font-heading text-4xl">HOY ✈️</p>
            ) : (
              <div>
                <p className="text-sm tracking-wide text-muted-foreground">
                  FALTAN
                </p>
                <p className="font-heading text-4xl">
                  {label.primary}{" "}
                  <span className="text-2xl text-muted-foreground">
                    {label.secondary}
                  </span>
                </p>
                {detailed && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {detailed.days} días · {detailed.hours} horas ·{" "}
                    {detailed.minutes} minutos
                  </p>
                )}
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Viaje pasado</p>
          )}

          <p className="text-sm">
            {formatTripDateRange(trip.inicio_fecha, trip.fin_fecha)}
            {trip.inicio_hora ? ` · ${trip.inicio_hora}` : ""}
          </p>

          {upcoming && <CountdownProgress trip={trip} />}

          {trip.nota && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {trip.nota}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/cuenta-atras/${trip.id}/editar`}>
                  <Pencil className="size-4" />
                  Editar
                </Link>
              }
            />
            <CountdownDeleteButton id={trip.id} />
          </div>
        </div>
      </div>

      {upcoming && (
        <CountdownRemindersForm tripId={trip.id} reminder={reminder} />
      )}
    </div>
  );
}
