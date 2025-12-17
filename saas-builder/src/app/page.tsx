// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center space-y-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-400/80">
            SaaS Builder · Next.js · IA
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Génère, édite et exporte des sites Next.js
            <span className="block text-blue-400">sans toucher au code.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Décris ton projet, laisse l&rsquo;IA créer la structure, le contenu et
            le code, puis ajuste tout dans un éditeur visuel moderne.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 transition"
          >
            Accéder au dashboard
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900 transition"
          >
            Voir comment ça marche
          </a>
        </div>

        <div
          id="how-it-works"
          className="mt-8 grid gap-4 text-left text-xs sm:text-sm text-slate-300 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="font-medium text-slate-100 mb-1">1. Brief</p>
            <p>Tu remplis un formulaire simple pour décrire ton site.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="font-medium text-slate-100 mb-1">2. Génération</p>
            <p>On crée un schéma JSON, le contenu et les fichiers Next.js.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="font-medium text-slate-100 mb-1">3. Edition</p>
            <p>Tu ajustes tout dans un visual builder ou en mode code.</p>
          </div>
        </div>
      </div>
    </main>
  );
}