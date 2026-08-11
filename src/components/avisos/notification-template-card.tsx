"use client";

import { useState, useTransition } from "react";
import {
  setNotificationTemplateEnabled,
  updateNotificationTemplate,
  type NotificationFormState,
} from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NotificationTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NotificationTemplateCard({
  template,
}: {
  template: NotificationTemplate;
}) {
  const [enabled, setEnabled] = useState(template.enabled);
  const [state, setState] = useState<NotificationFormState>({});
  const [pending, startTransition] = useTransition();

  const boundUpdate = updateNotificationTemplate.bind(null, template.id);

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        !enabled && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-lg">{template.label}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {template.description}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {template.key}
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={enabled}
            disabled={pending}
            onChange={(event) => {
              const next = event.target.checked;
              setEnabled(next);
              startTransition(async () => {
                const result = await setNotificationTemplateEnabled(
                  template.id,
                  next,
                );
                if (result.error) {
                  setEnabled(!next);
                  setState({ error: result.error });
                }
              });
            }}
          />
          {enabled ? "Activa" : "Desactivada"}
        </label>
      </div>

      {template.variables.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Variables:{" "}
          {template.variables.map((v) => `{{${v}}}`).join(", ")}
        </p>
      )}

      <form
        className="mt-4 flex flex-col gap-3"
        action={(formData) => {
          formData.set("enabled", enabled ? "si" : "no");
          startTransition(async () => {
            const result = await boundUpdate({}, formData);
            setState(result);
          });
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor={`title-${template.id}`}>Título</Label>
          <Input
            id={`title-${template.id}`}
            name="title_template"
            required
            maxLength={120}
            defaultValue={template.title_template}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`body-${template.id}`}>Cuerpo</Label>
          <Textarea
            id={`body-${template.id}`}
            name="body_template"
            required
            rows={3}
            maxLength={500}
            defaultValue={template.body_template}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enlace al pulsar:{" "}
          <span className="font-mono">{template.url_default}</span>
        </p>
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-sm text-muted-foreground">Guardado.</p>
        )}
        <Button type="submit" size="sm" disabled={pending} className="self-start">
          {pending ? "Guardando…" : "Guardar textos"}
        </Button>
      </form>
    </article>
  );
}
