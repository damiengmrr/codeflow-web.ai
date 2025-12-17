// src/app/dashboard/page.tsx
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function createProject(formData: FormData) {
  "use server";

  const name = formData.get("name");
  const brief = formData.get("brief");

  if (!name || typeof name !== "string" || !name.trim()) {
    // On pourrait gérer les erreurs de validation plus proprement plus tard
    return;
  }

  await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.trim(),
      brief: brief && typeof brief === "string" ? brief : undefined,
    }),
  });

  redirect("/dashboard");
}

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tes projets
          </h1>
          <p className="text-sm text-slate-400">
            Crée un projet, remplis un brief et laisse l&rsquo;IA générer ton site
            Next.js.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
        {/* Liste des projets */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-slate-200">Projets existants</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucun projet pour l&rsquo;instant. Crée-en un juste à droite.
            </p>
          ) : (
            <ul className="space-y-3">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
                >
                  <div className="space-y-[2px]">
                    <p className="text-sm font-medium text-slate-50">
                      {project.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      slug: <span className="font-mono">{project.slug}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {project.status}
                    </span>
                    <a
                      href={`/editor/${project.id}`}
                      className="text-[11px] rounded-full border border-blue-500/60 px-3 py-1 text-blue-400 hover:bg-blue-500/10 transition"
                    >
                      Éditer
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulaire de création */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-medium text-slate-200 mb-2">
            Nouveau projet
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Donne un nom à ton projet, on s&rsquo;en servira pour générer le site.
          </p>
          <form action={createProject} className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-slate-300"
              >
                Nom du projet
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Ex: Site vitrine pour Pridano Tech"
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="brief"
                className="block text-xs font-medium text-slate-300"
              >
                Brief (optionnel)
              </label>
              <textarea
                id="brief"
                name="brief"
                rows={4}
                placeholder="Décris rapidement le type de site, le business, le style visuel..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 transition"
            >
              Créer le projet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}