import { getProfiles } from "@/lib/dal";
import {
  getAppUpdates,
  getNextAppVersion,
} from "@/lib/queries-updates";
import { UpdateForm } from "@/components/notes/update-form";
import { UpdateList } from "@/components/notes/update-list";

export default async function ActualizacionesPage() {
  const [updates, profiles, next] = await Promise.all([
    getAppUpdates(),
    getProfiles(),
    getNextAppVersion(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Registro de versiones del producto (v.X.XX). Independiente del
        seguimiento del Cuaderno y el Tablero.
      </p>
      <UpdateForm nextMajor={next.major} nextMinor={next.minor} />
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl">Historial</h2>
        <UpdateList updates={updates} profiles={profiles} />
      </section>
    </div>
  );
}
