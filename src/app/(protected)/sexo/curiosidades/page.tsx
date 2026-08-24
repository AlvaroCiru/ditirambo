import { formatFechaCorta } from "@/lib/sexo-meta";
import { getSexoCuriosidades } from "@/lib/queries-sexo";

export default async function SexoCuriosidadesPage() {
  const c = await getSexoCuriosidades();

  const cards = [
    {
      title: "Encuentros",
      value: String(c.encuentros),
    },
    {
      title: "Lugares",
      value: String(c.lugares),
    },
    {
      title: "Ciudades",
      value: String(c.ciudades),
    },
    {
      title: "Provincias",
      value: String(c.provincias),
    },
    {
      title: "Países",
      value: String(c.paises),
    },
    {
      title: "Primera vez registrada",
      value: c.primeraFecha ? formatFechaCorta(c.primeraFecha) : "—",
    },
    {
      title: "Último encuentro",
      value: c.ultimaFecha ? formatFechaCorta(c.ultimaFecha) : "—",
    },
    {
      title: "Lugar más repetido",
      value: c.lugarMasRepetido
        ? `${c.lugarMasRepetido.nombre} (${c.lugarMasRepetido.count})`
        : "—",
    },
    {
      title: "Provincia más repetida",
      value: c.provinciaMasRepetida ?? "—",
    },
    {
      title: "Mes con más encuentros",
      value: c.mesMasEncuentros ?? "—",
    },
    {
      title: "Más lejos de casa",
      value: c.masLejos
        ? `${c.masLejos.nombre} · ${c.masLejos.km} km`
        : "—",
    },
    {
      title: "Primera vez fuera de España",
      value: c.primeraFueraEspana ?? "—",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-border bg-card p-4"
        >
          <p className="text-xs text-muted-foreground">{card.title}</p>
          <p className="mt-2 font-heading text-xl leading-snug">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
