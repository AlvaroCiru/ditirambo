"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/sexo", label: "Inicio", exact: true },
  { href: "/sexo/mapa", label: "Mapa" },
  { href: "/sexo/lugares", label: "Lugares" },
  { href: "/sexo/timeline", label: "Línea temporal" },
];

export function SexoSectionNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sexo"
      className="flex w-full flex-wrap items-center gap-1 border-b border-border pb-3"
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
              "rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors",
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
