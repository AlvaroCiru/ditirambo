import Link from "next/link";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { getPushSettings } from "@/lib/actions/push";
import { emailToUsername } from "@/lib/username";
import { ProfileForm } from "@/components/profile/profile-form";
import { PushSettings } from "@/components/profile/push-settings";
import { UserAvatar } from "@/components/profile/user-avatar";

export default async function PerfilPage() {
  const [user, profiles, pushSettings] = await Promise.all([
    getAuthedUser(),
    getProfiles(),
    getPushSettings(),
  ]);
  const me = profiles.find((p) => p.id === user.id);
  const partner = profiles.find((p) => p.id !== user.id);
  const username = emailToUsername(user.email ?? "");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 md:max-w-xl">
      <h1 className="font-heading text-2xl">Tu perfil</h1>
      <div className="rounded-xl border border-border bg-card p-6">
        <ProfileForm
          key={`${username}-${me?.display_name}-${me?.avatar_url}`}
          displayName={me?.display_name ?? username}
          username={username}
          avatarUrl={me?.avatar_url ?? null}
        />
      </div>
      {partner && (
        <Link
          href={`/perfil/${partner.id}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
        >
          <UserAvatar
            displayName={partner.display_name}
            avatarUrl={partner.avatar_url}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{partner.display_name}</p>
            <p className="text-sm text-muted-foreground">Ver perfil</p>
          </div>
        </Link>
      )}
      <PushSettings initial={pushSettings} />
    </div>
  );
}
