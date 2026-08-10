export default function CitasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl">Planificador de citas</h1>
        <p className="text-sm text-muted-foreground">
          Un lugar para concertar encuentros y quedar a gusto.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card px-6 py-10 text-center">
        <p className="font-heading text-2xl italic text-accent">En proceso</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Esta estancia aún se está amueblando. Pronto servirá para concertar
          citas, apuntar encuentros y quedar sin líos ni prisas. Dejad que
          repose un poco el calendario: ya tendrá su hora.
        </p>
      </section>
    </div>
  );
}
