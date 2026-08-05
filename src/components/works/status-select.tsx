"use client";

import { useTransition } from "react";
import { updateWorkStatus } from "@/lib/actions/works";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/categories";
import type { WorkStatus } from "@/lib/types";

export function StatusSelect({
  workId,
  estado,
}: {
  workId: string;
  estado: WorkStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={estado}
      disabled={pending}
      onValueChange={(value) => {
        startTransition(() => {
          void updateWorkStatus(workId, value as string);
        });
      }}
    >
      <SelectTrigger className="w-fit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((status) => (
          <SelectItem key={status} value={status}>
            {STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
