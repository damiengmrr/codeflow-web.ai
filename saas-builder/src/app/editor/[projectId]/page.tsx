// saas-builder/src/app/editor/[projectId]/page.tsx
import { prisma } from "@/lib/db";
import type { WebsiteSchema } from "@/lib/schema/types";
import VisualBuilder from "@/components/builder/VisualBuilder";
import Link from "next/link";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectEditorPage({ params }: PageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { schema: true },
  });

  if (!project) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white p-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <h1 className="text-lg font-semibold">Projet introuvable</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ce projet n’existe pas (ou n’est plus accessible).
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  const schema: WebsiteSchema = project.schema
    ? (project.schema.schemaJson as unknown as WebsiteSchema)
    : {
        website: {
          name: project.name,
          colors: {
            primary: "#3b82f6",
            secondary: "#0f172a",
          },
          pages: [],
        },
      };

  return <VisualBuilder projectId={projectId} initialSchema={schema} />;
}