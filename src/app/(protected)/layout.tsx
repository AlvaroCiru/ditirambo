import type { ReactNode } from "react";
import Link from "next/link";
import { getMyProfile } from "@/lib/dal";
import { AppShell } from "@/components/nav/app-shell";
import { LogoutButton } from "@/components/nav/logout-button";
import { UserAvatar } from "@/components/profile/user-avatar";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const me = await getMyProfile();
  const isAdmin = Boolean(me?.es_admin);

  const profileSlot = (
    <>
      {me && (
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
      )}
      <LogoutButton />
    </>
  );

  return (
    <AppShell profileSlot={profileSlot} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
