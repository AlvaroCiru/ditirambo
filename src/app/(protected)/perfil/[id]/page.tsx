import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ExpandableAvatar } from "@/components/profile/expandable-avatar";
import { getAuthedUser, getProfiles } from "@/lib/dal";

export default async function PerfilUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, profiles] = await Promise.all([
    getAuthedUser(),
    getProfiles(),
  ]);

  if (id === user.id) {
    redirect("/perfil");
  }

  const profile = profiles.find((p) => p.id === id);
  if (!profile) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 md:max-w-xl">
      <div className="flex flex-col gap-2">
        <Link
          href="/perfil"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Tu perfil
        </Link>
        <h1 className="font-heading text-2xl">{profile.display_name}</h1>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8">
        <ExpandableAvatar
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
          size="xl"
        />
        <p className="text-center text-sm text-muted-foreground">
          Toca la foto para ampliarla.
        </p>
      </div>
    </div>
  );
}
