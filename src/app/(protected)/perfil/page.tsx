import { getAuthedUser, getProfiles } from "@/lib/dal";
import { emailToUsername } from "@/lib/username";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function PerfilPage() {
  const [user, profiles] = await Promise.all([getAuthedUser(), getProfiles()]);
  const me = profiles.find((p) => p.id === user.id);
  const username = emailToUsername(user.email ?? "");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Tu perfil</h1>
      <div className="max-w-md rounded-xl border border-border bg-card p-6">
        <ProfileForm
          key={`${username}-${me?.display_name}-${me?.avatar_url}`}
          displayName={me?.display_name ?? username}
          username={username}
          avatarUrl={me?.avatar_url ?? null}
        />
      </div>
    </div>
  );
}
