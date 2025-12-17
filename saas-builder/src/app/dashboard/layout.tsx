// src/app/dashboard/layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { headers } from "next/headers";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Next 16: headers() est async (sinon t’avais l’erreur "Property 'get' does not exist...")
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  // IMPORTANT: il faut que middleware mette x-pathname (je te donne l’étape 1bis juste après)
  const isEditor = pathname.includes("/dashboard/projects/") && pathname.includes("/editor");

  if (isEditor) {
    // Fullscreen Wix-like: pas de header dashboard, pas de container, pas de fond sombre
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold">
              SB
            </div>
            <span className="text-sm font-semibold tracking-tight">SaaS Builder</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs text-slate-300">
            <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Dashboard
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}