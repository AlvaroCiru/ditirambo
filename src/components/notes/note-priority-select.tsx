"use client";

import { useTransition } from "react";
import { updateDevNotePriority } from "@/lib/actions/notes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTE_PRIORITY_LABELS, NOTE_PRIORITY_ORDER } from "@/lib/notes-meta";
import type { DevNotePriority } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_TONE: Record<DevNotePriority, string> = {
  alta: "text-destructive",
  media: "text-accent",
  baja: "text-muted-foreground",
};

export function NotePrioritySelect({
  noteId,
  prioridad,
}: {
  noteId: string;
  prioridad: DevNotePriority;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={prioridad}
      disabled={pending}
      onValueChange={(value) => {
        startTransition(() => {
          void updateDevNotePriority(noteId, value as string);
        });
      }}
    >
      <SelectTrigger className={cn("w-fit", PRIORITY_TONE[prioridad])}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {NOTE_PRIORITY_ORDER.map((priority) => (
          <SelectItem key={priority} value={priority}>
            {NOTE_PRIORITY_LABELS[priority]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
