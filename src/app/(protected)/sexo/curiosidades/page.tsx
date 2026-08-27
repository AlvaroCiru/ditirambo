import Link from "next/link";
import { formatFechaCorta } from "@/lib/sexo-meta";
import { getSexoCuriosidades } from "@/lib/queries-sexo";

export default async function SexoCuriosidadesPage() {
  const c = await getSexoCuriosidades();

  const counts = [
    { label: "Lugares diferentes", value: String(c.lugares) },
    { label: "Ciudades / localidades", value: String(c.ciudades) },
    { label: "Provincias", value: String(c.provincias) },
    { label: "Comunidades autónomas", value: String(c.comunidades) },
    { label: "Países", value: String(c.paises) },
  ];

  const facts = [
    {
      label: "Primera provincia",
      value: c.primeraProvincia ?? "—",
    },
    {
      label: "Primera comunidad fuera de Madrid",
      value: c.primeraComunidadFueraMadrid ?? "—",
    },
    {
      label: "Primer país extranjero",
      value: c.primerPaisExtranjero ?? "—",
    },
    {
      label: "Última provincia nueva",
      value: c.ultimaProvinciaNueva ?? "—",
    },
    {
      label: "Último país nuevo",
      value: c.ultimoPaisNuevo ?? "—",
    },
    {
      label: "Lugar más lejano",
      value: c.masLejos
        ? `${c.masLejos.nombre} (${c.masLejos.km} km)${c.masLejos.ubicacion ? ` · ${c.masLejos.ubicacion}` : ""}`
        : "—",
    },
    {
      label: "Desde",
      value: c.primeraFecha ? formatFechaCorta(c.primeraFecha) : "—",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl">Curiosidades</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Solo geografía y primeras veces — sin frecuencias.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="font-heading text-2xl">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {facts.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 text-sm">{item.value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-muted-foreground">
        La distancia se calcula desde{" "}
        <Link href="/sexo/ajustes" className="underline">
          la casa configurada
        </Link>
        .
      </p>
    </div>
  );
}
