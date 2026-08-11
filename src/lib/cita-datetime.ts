/** Formatea ISO → valor para <input type="datetime-local"> en hora local. */
export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatCitaRange(inicioIso: string, finIso: string): string {
  const inicio = new Date(inicioIso);
  const fin = new Date(finIso);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return "";
  }

  const sameDay =
    inicio.getFullYear() === fin.getFullYear() &&
    inicio.getMonth() === fin.getMonth() &&
    inicio.getDate() === fin.getDate();

  const dateFmt = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${dateFmt.format(inicio)} · ${timeFmt.format(inicio)} – ${timeFmt.format(fin)}`;
  }

  return `${dateFmt.format(inicio)} ${timeFmt.format(inicio)} → ${dateFmt.format(fin)} ${timeFmt.format(fin)}`;
}

export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Días del mes (incluye huecos de inicio/fin de semana, lunes=primer día). */
export function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay(): 0 domingo … 6 sábado → lunes=0
  const startOffset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function citaTouchesDay(
  inicioIso: string,
  finIso: string,
  day: Date,
): boolean {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    23,
    59,
    59,
    999,
  );
  const inicio = new Date(inicioIso);
  const fin = new Date(finIso);
  return inicio <= dayEnd && fin >= dayStart;
}
