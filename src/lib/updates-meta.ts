/** Formato fijo v.1.01, v.1.02, … */
export function formatAppVersion(major: number, minor: number): string {
  return `v.${major}.${String(minor).padStart(2, "0")}`;
}
