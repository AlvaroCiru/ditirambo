"use client";

import {
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { APP_MODULES } from "@/lib/modules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ditirambo-sidebar-expanded";
const SIDEBAR_EVENT = "ditirambo-sidebar";

function subscribeExpanded(onChange: () => void) {
  window.addEventListener(SIDEBAR_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SIDEBAR_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getExpandedSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) !== "0";
}

function getExpandedServerSnapshot() {
  return true;
}

function setSidebarExpanded(next: boolean) {
  window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  window.dispatchEvent(new Event(SIDEBAR_EVENT));
}

export function AppShell({
  profileSlot,
  children,
}: {
  profileSlot: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const expanded = useSyncExternalStore(
    subscribeExpanded,
    getExpandedSnapshot,
    getExpandedServerSnapshot,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (showLabels: boolean) => (
    <nav aria-label="Módulos" className="flex flex-col gap-1 px-2 py-2">
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
            title={mod.label}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              showLabels ? "" : "justify-center px-2",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {showLabels && <span className="truncate">{mod.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="border-b border-border md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </Button>
            <Link href="/resenas" className="font-heading text-xl italic">
              Ditirambo
            </Link>
          </div>
          <div className="flex min-w-0 items-center gap-3">{profileSlot}</div>
        </div>
        {mobileOpen && (
          <div className="border-t border-border bg-card pb-2">
            {nav(true)}
          </div>
        )}
      </div>

      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-card pt-[env(safe-area-inset-top)] transition-[width] duration-200 md:flex",
          expanded ? "w-56" : "w-16",
        )}
      >
        <div
          className={cn(
            "flex items-start gap-2 px-3 py-4",
            expanded ? "justify-between" : "flex-col items-center",
          )}
        >
          {expanded ? (
            <div className="min-w-0">
              <Link href="/resenas" className="font-heading text-xl italic">
                Ditirambo
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                Espacios compartidos
              </p>
            </div>
          ) : (
            <Link
              href="/resenas"
              className="font-heading text-lg italic"
              title="Ditirambo"
            >
              D
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={
              expanded ? "Recoger barra lateral" : "Desplegar barra lateral"
            }
            aria-expanded={expanded}
            onClick={() => setSidebarExpanded(!expanded)}
          >
            {expanded ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </div>
        {nav(expanded)}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden border-b border-border bg-card md:block md:pt-[env(safe-area-inset-top)]">
          <div className="flex w-full items-center justify-end gap-3 px-6 py-3">
            {profileSlot}
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
