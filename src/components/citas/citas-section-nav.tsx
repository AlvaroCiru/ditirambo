"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/citas", label: "Calendario", exact: true },
  { href: "/citas/lista", label: "Citas" },
  { href: "/citas/nueva", label: "Proponer" },
];

export function CitasSectionNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Planificador de citas"
      className="flex w-full items-center gap-1 border-b border-border pb-3"
    >
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors sm:flex-none",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
