import Image from "next/image";
import { SexoSugerenciaActions } from "@/components/sexo/sexo-sugerencia-actions";
import { SexoSugerenciaForm } from "@/components/sexo/sexo-sugerencia-form";
import { UserAvatar } from "@/components/profile/user-avatar";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { SEXO_TIPO_LABEL_SINGULAR } from "@/lib/sexo-meta";
import { getSexoSugerencias } from "@/lib/queries-sexo";

export default async function SexoPendientesPage() {
  const [user, profiles, sugerencias] = await Promise.all([
    getAuthedUser(),
    getProfiles(),
    getSexoSugerencias(),
  ]);

  const propuestas = sugerencias.filter((s) => s.estado === "propuesta");
  const aceptadas = sugerencias.filter((s) => s.estado === "aceptada");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl">Pendientes</h2>
        {propuestas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay sugerencias abiertas.
          </p>
        ) : (
          propuestas.map((s) => {
            const author = profiles.find((p) => p.id === s.propuesto_por);
            const canRespond = s.propuesto_por !== user.id;
            return (
              <article
                key={s.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                {s.imagen_url && (
                  <div className="relative aspect-video overflow-hidden rounded-md bg-background">
                    <Image
                      src={s.imagen_url}
                      alt=""
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">
                    {SEXO_TIPO_LABEL_SINGULAR[s.tipo]}
                  </p>
                  <h3 className="font-heading text-lg">{s.titulo}</h3>
                  {s.ubicacion_texto && (
                    <p className="text-sm text-muted-foreground">
                      {s.ubicacion_texto}
                    </p>
                  )}
                  {s.notas && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.notas}
                    </p>
                  )}
                </div>
                {author && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <UserAvatar
                      displayName={author.display_name}
                      avatarUrl={author.avatar_url}
                      size="sm"
                    />
                    Propuesto por {author.display_name}
                  </div>
                )}
                {canRespond && <SexoSugerenciaActions id={s.id} />}
              </article>
            );
          })
        )}

        {aceptadas.length > 0 && (
          <div className="mt-2">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Aceptadas recientemente
            </h3>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {aceptadas.slice(0, 5).map((s) => (
                <li key={s.id}>{s.titulo}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-heading text-xl">Nueva sugerencia</h2>
        <SexoSugerenciaForm />
      </section>
    </div>
  );
}
