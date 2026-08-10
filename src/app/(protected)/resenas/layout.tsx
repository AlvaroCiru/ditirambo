import type { ReactNode } from "react";
import { SectionNav } from "@/components/nav/section-nav";

export default function ResenasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionNav />
      {children}
    </div>
  );
}
