import type { ReactNode } from "react";
import Link from "next/link";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { MainNav } from "@/components/nav/main-nav";
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
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-card pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="shrink-0 font-heading text-xl italic">
              Ditirambo
            </Link>
            <div className="flex min-w-0 items-center gap-3 sm:hidden">
              {profileLink}
              <LogoutButton />
            </div>
          </div>
          <MainNav />
          <div className="hidden min-w-0 items-center gap-3 sm:flex">
            {profileLink}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
