import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = await prisma.$queryRaw`SELECT NOW()`;
    return NextResponse.json({ ok: true, now }, { status: 200 });
  } catch (error) {
    console.error("DB healthcheck error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}