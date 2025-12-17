// src/app/api/projects/[projectId]/generate/code/route.ts
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { prisma } from "@/lib/db";
import type { WebsiteSchema } from "@/lib/schema/types";

export const runtime = "nodejs";

// Construit tous les fichiers du projet Next.js à partir du WebsiteSchema
function buildFilesFromSchema(schema: WebsiteSchema): Record<string, string> {
  const projectName = schema.website.name || "generated-site";

  // 1) websiteSchema.ts (les données du site)
  const websiteSchemaSource =
    `// Données générées par SaaS Builder\n` +
    `export const websiteSchema = ${JSON.stringify(schema, null, 2)} as const;\n\n` +
    `export type WebsiteSchema = typeof websiteSchema;\n`;

  // 2) package.json minimal pour Next + Tailwind
  const packageJson = {
    name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "latest",
      react: "latest",
      "react-dom": "latest",
    },
    devDependencies: {
      typescript: "latest",
      "@types/react": "latest",
      "@types/node": "latest",
      tailwindcss: "latest",
      autoprefixer: "latest",
      postcss: "latest",
      eslint: "latest",
      "eslint-config-next": "latest",
    },
  };

  const tsconfig = `{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "types": ["node"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`;

  const nextEnv = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`;

  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default nextConfig;
`;

  const tailwindConfig = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;

  const postcssConfig = `export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
`;

  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Styles globaux simples pour compatibilité Tailwind */
html, body {
  background-color: #020617;
  color: #f8fafc;
}

a {
  color: #60a5fa;
}
a:hover {
  color: #93c5fd;
}
`;

  const layoutTsx = `"use client";

import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
`;

  const appPageTsx = `import { websiteSchema } from "../lib/websiteSchema";

function renderSection(section: any) {
  const type = section.type;
  const props = section.props || {};

  if (type === "hero") {
    return (
      <section
        key={section.id}
        className="mb-12 rounded-3xl border border-slate-800 bg-slate-900/60 p-8"
      >
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          {props.headline ?? "Titre principal"}
        </h1>
        <p className="mb-6 text-slate-300">
          {props.subheadline ?? "Sous-titre de présentation."}
        </p>
        <div className="flex flex-wrap gap-3">
          {props.ctaPrimary && (
            <button className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow shadow-blue-500/30 hover:bg-blue-400">
              {props.ctaPrimary}
            </button>
          )}
          {props.ctaSecondary && (
            <button className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500">
              {props.ctaSecondary}
            </button>
          )}
        </div>
      </section>
    );
  }

  if (type === "features") {
    const items = Array.isArray(props.items) ? props.items : [];
    return (
      <section
        key={section.id}
        className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <h2 className="mb-4 text-2xl font-semibold">
          {props.title ?? "Nos points forts"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (type === "services") {
    const items = Array.isArray(props.items) ? props.items : [];
    return (
      <section
        key={section.id}
        className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <h2 className="mb-4 text-2xl font-semibold">
          {props.title ?? "Nos services"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <h3 className="text-sm font-medium">{item.name}</h3>
              <p className="mt-1 text-xs text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (type === "cta") {
    return (
      <section
        key={section.id}
        className="mb-10 rounded-3xl border border-blue-500/40 bg-blue-500/10 p-6 text-center"
      >
        <h2 className="mb-2 text-2xl font-semibold">{props.title}</h2>
        <p className="mb-4 text-sm text-blue-100">{props.text}</p>
        {props.buttonLabel && (
          <button className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow shadow-blue-500/40 hover:bg-blue-400">
            {props.buttonLabel}
          </button>
        )}
      </section>
    );
  }

  if (type === "pricing") {
    const plans = Array.isArray(props.plans) ? props.plans : [];
    return (
      <section
        key={section.id}
        className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <h2 className="mb-4 text-2xl font-semibold">
          {props.title ?? "Nos offres"}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={
                "rounded-2xl border p-4 " +
                (plan.highlight
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-800 bg-slate-950/60")
              }
            >
              <h3 className="text-sm font-medium">{plan.name}</h3>
              <p className="mt-1 text-lg font-semibold">{plan.price}</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {(plan.features || []).map((f: string, i: number) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (type === "faq") {
    const items = Array.isArray(props.items) ? props.items : [];
    return (
      <section
        key={section.id}
        className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <h2 className="mb-4 text-2xl font-semibold">{props.title ?? "FAQ"}</h2>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-xl bg-slate-950/60 p-3">
              <p className="text-xs font-medium text-slate-100">
                {item.question}
              </p>
              <p className="mt-1 text-xs text-slate-300">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (type === "contact") {
    return (
      <section
        key={section.id}
        className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <h2 className="mb-2 text-2xl font-semibold">
          {props.title ?? "Contact"}
        </h2>
        <p className="mb-4 text-sm text-slate-300">
          {props.description ??
            "Laisse-nous un message, on te répond rapidement."}
        </p>
        <div className="space-y-2 text-xs text-slate-400">
          <p>• Formulaire de contact à intégrer ici</p>
          <p>• Coordonnées, réseaux sociaux, etc.</p>
        </div>
      </section>
    );
  }

  if (type === "gallery") {
    const images = Array.isArray(props.images) ? props.images : [];
    return (
      <section
        key={section.id}
        className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <h2 className="mb-4 text-2xl font-semibold">
          {props.title ?? "Galerie"}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="flex h-32 items-center justify-center rounded-2xl bg-slate-950/60 text-[10px] text-slate-400"
            >
              {img.alt ?? "Image de projet"}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return null;
}

export default function Page() {
  const pages = websiteSchema.website.pages || [];
  const homePage =
    pages.find((p) => p.slug === "home") || pages[0] || null;

  if (!homePage) {
    return (
      <div className="text-sm text-slate-300">
        Aucun contenu pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {homePage.title}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Site généré automatiquement par ton SaaS.
        </p>
      </header>

      {homePage.sections.map((section) => renderSection(section))}
    </div>
  );
}
`;

  const slugPageTsx = `import { websiteSchema } from "../../lib/websiteSchema";

function renderSection(section: any) {
  // même rendu que sur la home, on pourrait factoriser mais c'est ok pour une V1
  const type = section.type;
  const props = section.props || {};

  if (type === "hero") {
    return (
      <section
        key={section.id}
        className="mb-12 rounded-3xl border border-slate-800 bg-slate-900/60 p-8"
      >
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          {props.headline ?? "Titre principal"}
        </h1>
        <p className="mb-6 text-slate-300">
          {props.subheadline ?? "Sous-titre de présentation."}
        </p>
      </section>
    );
  }

  // Pour ne pas dupliquer 300 lignes, on simplifie un peu ici
  return (
    <section
      key={section.id}
      className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300"
    >
      <p className="mb-1 font-semibold">{section.type}</p>
      <pre className="overflow-x-auto rounded bg-slate-950/80 p-2">
        {JSON.stringify(section.props, null, 2)}
      </pre>
    </section>
  );
}

export default function Page({ params }: { params: { slug: string } }) {
  const pages = websiteSchema.website.pages || [];
  const page =
    pages.find((p) => p.slug === params.slug) || null;

  if (!page) {
    return (
      <div className="space-y-2 text-sm text-slate-300">
        <p>Page introuvable.</p>
        <p className="text-xs text-slate-500">
          Vérifie le slug ou regénère le site.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {page.title}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Page générée automatiquement à partir de ton schema.
        </p>
      </header>

      {page.sections.map((section) => renderSection(section))}
    </div>
  );
}
`;

  // Construction de la map de fichiers
  const files: Record<string, string> = {
    "package.json": JSON.stringify(packageJson, null, 2),
    "tsconfig.json": tsconfig,
    "next-env.d.ts": nextEnv,
    "next.config.mjs": nextConfig,
    "tailwind.config.ts": tailwindConfig,
    "postcss.config.mjs": postcssConfig,
    "app/globals.css": globalsCss,
    "app/layout.tsx": layoutTsx,
    "app/page.tsx": appPageTsx,
    "app/[slug]/page.tsx": slugPageTsx,
    "lib/websiteSchema.ts": websiteSchemaSource,
  };

  return files;
}

// POST /api/projects/:projectId/generate/code
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { schema: true },
    });

    if (!project || !project.schema || !project.schema.schemaJson) {
      return NextResponse.json(
        { error: "Schema introuvable pour ce projet." },
        { status: 404 },
      );
    }

    const rawSchema = project.schema?.schemaJson;

if (!rawSchema) {
  return NextResponse.json(
    { error: "Aucun schema trouvé pour ce projet." },
    { status: 400 },
  );
}

// On sait que c'est du JSON compatible WebsiteSchema → double cast pour calmer TS
const schema = rawSchema as unknown as WebsiteSchema;

    // Générer les fichiers du projet
    const files = buildFilesFromSchema(schema);

    // Construire le ZIP en mémoire
    const zip = new JSZip();
    for (const [path, content] of Object.entries(files)) {
      zip.file(path, content);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    const fileName =
      (schema.website.name || "site-generated")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-") + ".zip";

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating code ZIP:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la génération du code." },
      { status: 500 },
    );
  }
}