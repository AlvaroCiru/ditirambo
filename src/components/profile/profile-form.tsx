"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/profile/user-avatar";

const initialState: ProfileFormState = {};

export function ProfileForm({
  displayName,
  username,
  avatarUrl,
}: {
  displayName: string;
  username: string;
  avatarUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <UserAvatar
          displayName={displayName}
          avatarUrl={avatarUrl}
          size="lg"
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="avatar">Foto de perfil</Label>
          <Input id="avatar" name="avatar" type="file" accept="image/*" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="display_name">Nombre para mostrar</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          maxLength={60}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input
          id="username"
          name="username"
          defaultValue={username}
          maxLength={40}
          autoCapitalize="none"
          required
        />
        <p className="text-xs text-muted-foreground">
          Es lo que usas para entrar en la aplicación.
        </p>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-muted-foreground">Perfil actualizado.</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
