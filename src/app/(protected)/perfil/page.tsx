import { getAuthedUser, getProfiles } from "@/lib/dal";
import { getPushSettings } from "@/lib/actions/push";
import { emailToUsername } from "@/lib/username";
import { ProfileForm } from "@/components/profile/profile-form";
import { PushSettings } from "@/components/profile/push-settings";

export default async function PerfilPage() {
  const [user, profiles, pushSettings] = await Promise.all([
    getAuthedUser(),
    getProfiles(),
    getPushSettings(),
  ]);
  const me = profiles.find((p) => p.id === user.id);
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
      <PushSettings initial={pushSettings} />
    </div>
  );
}
