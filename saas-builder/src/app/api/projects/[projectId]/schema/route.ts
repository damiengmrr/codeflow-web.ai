// src/app/api/projects/[projectId]/schema/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { WebsiteSchema } from "@/lib/schema/types";

// ⚠️ Avec ton setup Next 16, params est un Promise
type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

function createDefaultSchema(projectName: string): WebsiteSchema {
  return {
    website: {
      name: projectName,
      colors: {
        primary: "#3b82f6",
        secondary: "#0f172a",
      },
      pages: [
        {
          slug: "home",
          title: "Accueil",
          sections: [
            {
              id: "sec-hero-1",
              type: "hero",
              props: {
                headline: `Bienvenue sur ${projectName}`,
                subheadline:
                  "Ce site a été généré via SaaS Builder. Personnalise le contenu et la structure depuis le visual builder.",
                ctaPrimary: "Commencer",
                ctaSecondary: "En savoir plus",
                image: "/images/hero.jpg",
              },
            },
          ],
        },
      ],
    },
  };
}

// GET /api/projects/:projectId/schema
export async function GET(_req: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { schema: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable." },
        { status: 404 },
      );
    }

    // Si pas encore de schema → on en crée un par défaut
    if (!project.schema) {
      const defaultSchema = createDefaultSchema(project.name);

      const created = await prisma.projectSchema.create({
        data: {
          projectId: project.id,
          schemaJson:
            (defaultSchema as unknown as Prisma.InputJsonValue),
        },
      });

      const schema = created.schemaJson as unknown as WebsiteSchema;

      return NextResponse.json({ schema }, { status: 200 });
    }

    const schema = project.schema.schemaJson as unknown as WebsiteSchema;

    return NextResponse.json({ schema }, { status: 200 });
  } catch (error) {
    console.error("GET /api/projects/[projectId]/schema error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 },
    );
  }
}

// PUT /api/projects/:projectId/schema
export async function PUT(req: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable." },
        { status: 404 },
      );
    }

    let body: { schema?: WebsiteSchema };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "JSON invalide." },
        { status: 400 },
      );
    }

    if (!body.schema) {
      return NextResponse.json(
        { error: "Champ 'schema' manquant." },
        { status: 400 },
      );
    }

    const updated = await prisma.projectSchema.upsert({
      where: { projectId },
      create: {
        projectId,
        schemaJson:
          (body.schema as unknown as Prisma.InputJsonValue),
      },
      update: {
        schemaJson:
          (body.schema as unknown as Prisma.InputJsonValue),
        version: { increment: 1 },
      },
    });

    const schema = updated.schemaJson as unknown as WebsiteSchema;

    return NextResponse.json({ schema }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/projects/[projectId]/schema error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la sauvegarde." },
      { status: 500 },
    );
  }
}