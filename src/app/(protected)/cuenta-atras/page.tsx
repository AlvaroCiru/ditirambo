import Link from "next/link";
import { Plus } from "lucide-react";
import {
  CountdownHeroCard,
  CountdownTripCard,
} from "@/components/cuenta-atras/countdown-cards";
import { Button } from "@/components/ui/button";
import {
  getPastCountdownItems,
  getUpcomingCountdownItems,
} from "@/lib/queries-countdown";

export default async function CuentaAtrasPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const sp = await searchParams;
  const pasados = sp.vista === "pasados";

  if (pasados) {
    const trips = await getPastCountdownItems();
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl">Viajes pasados</h2>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/cuenta-atras/nuevo">
                <Plus className="size-4" />
                Solo cuenta atrás
              </Link>
            }
          />
        </div>
        {trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay viajes en el histórico.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((item) => (
              <CountdownTripCard key={item.id} item={item} size="sm" />
            ))}
          </div>
        )}
      </div>
    );
  }

  const upcoming = await getUpcomingCountdownItems();
  const [next, ...rest] = upcoming;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Incluye citas de categoría Viajes del planificador. La edición de
          esas citas se hace allí.
        </p>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/cuenta-atras/nuevo">
              <Plus className="size-4" />
              Solo cuenta atrás
            </Link>
          }
        />
      </div>

      {!next ? (
        <p className="text-sm text-muted-foreground">
          No hay viajes próximos. Crea una cita con categoría{" "}
          <Link href="/citas/nueva" className="underline">
            Viajes
          </Link>{" "}
          o un viaje{" "}
          <Link href="/cuenta-atras/nuevo" className="underline">
            solo para cuenta atrás
          </Link>
          .
        </p>
      ) : (
        <>
          <CountdownHeroCard item={next} />
          {rest.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-lg text-muted-foreground">
                Después…
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((item) => (
                  <CountdownTripCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
