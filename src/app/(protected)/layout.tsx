import type { ReactNode } from "react";
import Link from "next/link";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { LogoutButton } from "@/components/nav/logout-button";
import { UserAvatar } from "@/components/profile/user-avatar";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAuthedUser();
  const profiles = await getProfiles();
  const me = profiles.find((p) => p.id === user.id);

  const profileLink = me && (
    <Link
      href="/perfil"
      className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <UserAvatar
        displayName={me.display_name}
        avatarUrl={me.avatar_url}
        size="sm"
      />
      <span className="min-w-0 max-w-[8rem] truncate sm:max-w-[12rem]">
        {me.display_name}
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="border-b border-border md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link href="/resenas" className="font-heading text-xl italic">
            Ditirambo
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            {profileLink}
            <LogoutButton />
          </div>
        </div>
        <AppSidebar />
      </div>

      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden border-b border-border bg-card md:block md:pt-[env(safe-area-inset-top)]">
          <div className="flex w-full items-center justify-end gap-3 px-6 py-3">
            {profileLink}
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
