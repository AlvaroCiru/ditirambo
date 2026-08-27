import type { ReactNode } from "react";
import { Suspense } from "react";
import { CountdownTabs } from "@/components/cuenta-atras/countdown-tabs";

export default function CuentaAtrasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl">Cuenta atrás</h1>
        <p className="text-sm text-muted-foreground">
          Cuánto falta para los próximos viajes, de forma visual.
        </p>
      </div>
      <Suspense fallback={null}>
        <CountdownTabs />
      </Suspense>
      {children}
    </div>
  );
}
