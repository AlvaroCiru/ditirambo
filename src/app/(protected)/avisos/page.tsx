import { requireAdmin } from "@/lib/dal";
import { getNotificationTemplates } from "@/lib/queries-notifications";
import { NotificationTemplateCard } from "@/components/avisos/notification-template-card";

export default async function AvisosPage() {
  await requireAdmin();
  const templates = await getNotificationTemplates();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl">Centro de notificaciones</h1>
        <p className="text-sm text-muted-foreground">
          Plantillas de avisos push. Activar o desactivar cada tipo y editar
          los textos. Las nuevas plantillas se añaden en código cuando haya
          nuevos eventos.
        </p>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay plantillas configuradas.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {templates.map((template) => (
            <NotificationTemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
