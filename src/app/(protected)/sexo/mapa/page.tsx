import { SexoMapaClient } from "@/components/sexo/sexo-mapa-client";
import { getSexoEncuentros, getSexoLugares } from "@/lib/queries-sexo";

export default async function SexoMapaPage() {
  const [lugares, encuentros] = await Promise.all([
    getSexoLugares(),
    getSexoEncuentros(),
  ]);

  return <SexoMapaClient lugares={lugares} encuentros={encuentros} />;
}
