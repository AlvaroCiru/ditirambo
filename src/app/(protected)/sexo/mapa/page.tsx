import { SexoMapaClient } from "@/components/sexo/sexo-mapa-client";
import { getSexoLugares } from "@/lib/queries-sexo";

export default async function SexoMapaPage() {
  const lugares = await getSexoLugares({ sort: "recientes" });
  return <SexoMapaClient lugares={lugares} />;
}
