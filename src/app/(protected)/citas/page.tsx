import { CitasCalendar } from "@/components/citas/citas-calendar";
import { getCitasForCalendar } from "@/lib/queries-citas";

export default async function CitasCalendarioPage() {
  const now = new Date();
  const from = new Date(now.getFullYear() - 1, 0, 1).toISOString();
  const to = new Date(now.getFullYear() + 2, 11, 31, 23, 59, 59).toISOString();
  const citas = await getCitasForCalendar({ from, to });

  return <CitasCalendar citas={citas} />;
}
