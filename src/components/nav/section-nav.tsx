"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/reseñas", label: "Inicio", exact: true },
  { href: "/reseñas/obras", label: "Obras" },
  { href: "/reseñas/obras/nueva", label: "Añadir" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/reseñas") return pathname === "/reseñas";
  if (href === "/reseñas/obras/nueva") {
    return (
      pathname === "/reseñas/obras/nueva" ||
      pathname.startsWith("/reseñas/obras/nueva/")
    );
  }
  if (href === "/reseñas/obras") {
    return (
      pathname === "/reseñas/obras" ||
      (pathname.startsWith("/reseñas/obras/") &&
        !pathname.startsWith("/reseñas/obras/nueva"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SectionNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Reseñas"
      className="flex w-full items-center gap-1 border-b border-border pb-3"
    >
      {links.map((link) => {
        const active = isActive(pathname, link.href, link.exact);

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
