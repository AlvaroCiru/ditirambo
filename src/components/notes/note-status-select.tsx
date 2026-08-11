"use client";

import { useTransition } from "react";
import { updateDevNoteStatus } from "@/lib/actions/notes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTE_STATUS_LABELS, NOTE_STATUS_ORDER } from "@/lib/notes-meta";
import type { DevNoteStatus } from "@/lib/types";

export function NoteStatusSelect({
  noteId,
  estado,
}: {
  noteId: string;
  estado: DevNoteStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={estado}
      disabled={pending}
      onValueChange={(value) => {
        startTransition(() => {
          void updateDevNoteStatus(noteId, value as string);
        });
      }}
    >
      <SelectTrigger className="w-fit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {NOTE_STATUS_ORDER.map((status) => (
          <SelectItem key={status} value={status}>
            {NOTE_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
