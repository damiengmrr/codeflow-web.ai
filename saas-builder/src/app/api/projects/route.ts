// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ projects });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, brief } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Le champ 'name' est requis." },
        { status: 400 },
      );
    }

    // ⚠️ En attendant l'auth réelle : on utilise un user "demo"
    const demoEmail = "demo@local.test";

    const user = await prisma.user.upsert({
      where: { email: demoEmail },
      update: {},
      create: {
        email: demoEmail,
        hashedPassword: "demo", // TODO: à remplacer quand on fera la vraie auth
      },
    });

    const slug = slugify(name);

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        userId: user.id,
        brief: brief ?? null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet." },
      { status: 500 },
    );
  }
}