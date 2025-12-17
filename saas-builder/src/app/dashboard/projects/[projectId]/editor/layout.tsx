// src/app/dashboard/projects/[projectId]/editor/layout.tsx
import type { ReactNode } from "react";

export default function EditorLayout({ children }: { children: ReactNode }) {
  // Layout FULLSCREEN dédié à l’éditeur (pas de header dashboard, pas de max-w)
  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-slate-900">
      {children}
    </div>
  );
}