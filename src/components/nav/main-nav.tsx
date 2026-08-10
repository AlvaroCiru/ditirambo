"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/obras", label: "Obras" },
  { href: "/obras/nueva", label: "Añadir" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/obras/nueva") {
    return pathname === "/obras/nueva" || pathname.startsWith("/obras/nueva/");
  }
  if (href === "/obras") {
    return (
      pathname === "/obras" ||
      (pathname.startsWith("/obras/") && !pathname.startsWith("/obras/nueva"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full items-center gap-1 sm:w-auto">
      {links.map((link) => {
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors sm:flex-none",
              active
                ? "bg-accent text-accent-foreground"
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
