"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/profile/user-avatar";

export function ExpandableAvatar({
  displayName,
  avatarUrl,
  size = "xl",
}: {
  displayName: string;
  avatarUrl: string | null;
  size?: "sm" | "default" | "lg" | "xl";
}) {
  if (!avatarUrl) {
    return (
      <UserAvatar
        displayName={displayName}
        avatarUrl={null}
        size={size}
      />
    );
  }

  return (
    <Dialog>
      <DialogTrigger
        className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Ampliar foto de ${displayName}`}
      >
        <UserAvatar
          displayName={displayName}
          avatarUrl={avatarUrl}
          size={size}
        />
      </DialogTrigger>
      <DialogContent
        className="max-w-[min(92vw,28rem)] border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[28rem]"
        showCloseButton
      >
        <DialogTitle className="sr-only">Foto de {displayName}</DialogTitle>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-card">
          <Image
            src={avatarUrl}
            alt={`Foto de ${displayName}`}
            fill
            sizes="28rem"
            className="object-cover"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
