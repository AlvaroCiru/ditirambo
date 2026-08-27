"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function CountdownTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const vista = searchParams.get("vista") === "pasados" ? "pasados" : "proximos";

  if (pathname !== "/cuenta-atras") return null;

  return (
    <div className="flex gap-1 border-b border-border pb-3">
      {(
        [
          { key: "proximos", label: "Próximos", href: "/cuenta-atras" },
          {
            key: "pasados",
            label: "Pasados",
            href: "/cuenta-atras?vista=pasados",
          },
        ] as const
      ).map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            vista === tab.key
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
