"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-border bg-card md:w-56 md:border-r md:pt-[env(safe-area-inset-top)]">
      <div className="hidden px-4 py-4 md:block">
        <Link href="/resenas" className="font-heading text-xl italic">
          Ditirambo
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          Espacios compartidos
        </p>
      </div>

      <nav
        aria-label="Módulos"
        className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-col md:overflow-visible md:px-3 md:py-2"
      >
        {APP_MODULES.map((mod) => {
          const Icon = mod.icon;
          const active = mod.match.some(
            (prefix) =>
              pathname === prefix || pathname.startsWith(`${prefix}/`),
          );

          return (
            <Link
              key={mod.id}
              href={mod.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{mod.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
