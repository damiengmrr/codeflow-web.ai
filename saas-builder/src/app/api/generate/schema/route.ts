// src/app/api/generate/schema/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  buildSchemaGenerationPrompt,
  type ProjectBrief,
} from "@/lib/ai/prompts";
import type { WebsiteSchema, Section, SectionType } from "@/lib/schema/types";

const SECTION_TYPES: SectionType[] = [
  "hero",
  "features",
  "services",
  "testimonials",
  "pricing",
  "faq",
  "cta",
  "contact",
  "gallery",
];

function createSectionId(type: SectionType): string {
  return `sec-${type}-${Math.random().toString(36).slice(2, 8)}`;
}

function createHeroSection(projectName: string): Section {
  return {
    id: createSectionId("hero"),
    type: "hero",
    props: {
      headline: `Bienvenue sur ${projectName}`,
      subheadline:
        "Une brève phrase pour expliquer ce que propose ce site.",
      ctaPrimary: "Commencer",
      ctaSecondary: "En savoir plus",
      image: "/images/hero.jpg",
    },
  };
}

function createFeaturesSection(): Section {
  return {
    id: createSectionId("features"),
    type: "features",
    props: {
      title: "Nos points forts",
      items: [
        {
          title: "Point fort 1",
          description: "Un avantage clé mis en avant.",
        },
        {
          title: "Point fort 2",
          description: "Un deuxième élément de valeur.",
        },
      ],
    },
  };
}

function createServicesSection(): Section {
  return {
    id: createSectionId("services"),
    type: "services",
    props: {
      title: "Nos services",
      items: [
        {
          name: "Service principal",
          description: "Description courte et claire du service.",
        },
      ],
    },
  };
}

function createTestimonialsSection(): Section {
  return {
    id: createSectionId("testimonials"),
    type: "testimonials",
    props: {
      title: "Ils nous font confiance",
      items: [
        {
          name: "Client satisfait",
          quote: "Un retour positif qui rassure le visiteur.",
          role: "Fonction du client",
        },
      ],
    },
  };
}

function createPricingSection(): Section {
  return {
    id: createSectionId("pricing"),
    type: "pricing",
    props: {
      title: "Nos offres",
      plans: [
        {
          name: "Starter",
          price: "49€",
          features: ["Fonctionnalité A", "Fonctionnalité B"],
          highlight: true,
        },
      ],
    },
  };
}

function createFaqSection(): Section {
  return {
    id: createSectionId("faq"),
    type: "faq",
    props: {
      title: "FAQ",
      items: [
        {
          question: "Question fréquente ?",
          answer: "Une réponse claire et rassurante.",
        },
      ],
    },
  };
}

function createCtaSection(): Section {
  return {
    id: createSectionId("cta"),
    type: "cta",
    props: {
      title: "Prêt à commencer ?",
      text: "Contacte-nous pour discuter de ton projet.",
      buttonLabel: "Nous contacter",
    },
  };
}

function createContactSection(): Section {
  return {
    id: createSectionId("contact"),
    type: "contact",
    props: {
      title: "Contact",
      description: "Laisse-nous un message, on te répond rapidement.",
    },
  };
}

function createGallerySection(): Section {
  return {
    id: createSectionId("gallery"),
    type: "gallery",
    props: {
      title: "Galerie",
      images: [
        { src: "/images/sample-1.jpg", alt: "Réalisation 1" },
        { src: "/images/sample-2.jpg", alt: "Réalisation 2" },
      ],
    },
  };
}

function createSectionsForPage(slug: string, projectName: string): Section[] {
  switch (slug) {
    case "home":
      return [
        createHeroSection(projectName),
        createFeaturesSection(),
        createServicesSection(),
        createCtaSection(),
      ];
    case "services":
      return [createServicesSection(), createPricingSection(), createFaqSection()];
    case "about":
      return [createHeroSection(projectName), createFeaturesSection()];
    case "contact":
      return [createContactSection(), createFaqSection()];
    case "portfolio":
      return [createGallerySection(), createTestimonialsSection(), createCtaSection()];
    default:
      return [createHeroSection(projectName)];
  }
}

function createSchemaFromBrief(brief: ProjectBrief): WebsiteSchema {
  const {
    projectName,
    pagesWanted,
    primaryColor,
    secondaryColor,
  } = brief;

  const defaultPages = ["home", "services", "about", "contact"];
  const pagesSlugs = (pagesWanted && pagesWanted.length
    ? pagesWanted
    : defaultPages
  ).map((slug) => slug.toLowerCase());

  const colorPrimary = primaryColor ?? "#3b82f6";
  const colorSecondary = secondaryColor ?? "#0f172a";

  const slugToTitle: Record<string, string> = {
    home: "Accueil",
    services: "Services",
    about: "À propos",
    contact: "Contact",
    portfolio: "Portfolio",
  };

  return {
    website: {
      name: projectName,
      colors: {
        primary: colorPrimary,
        secondary: colorSecondary,
      },
      pages: pagesSlugs.map((slug) => ({
        slug,
        title: slugToTitle[slug] ?? slug,
        sections: createSectionsForPage(slug, projectName),
      })),
    },
  };
}

// POST /api/generate/schema
export async function POST(req: NextRequest) {
  let body: { brief?: ProjectBrief };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "JSON invalide." },
      { status: 400 },
    );
  }

  if (!body.brief) {
    return NextResponse.json(
      { error: "Champ 'brief' manquant." },
      { status: 400 },
    );
  }

  const brief = body.brief;

  if (!brief.projectName || !brief.businessType) {
    return NextResponse.json(
      { error: "projectName et businessType sont obligatoires." },
      { status: 400 },
    );
  }

  // On prépare quand même le prompt pour plus tard (Groq/Ollama)
  const prompt = buildSchemaGenerationPrompt(brief);

  // Pour l'instant, on génère le schema côté backend (pas d'appel IA réel)
  const schema = createSchemaFromBrief(brief);

  return NextResponse.json(
    {
      ok: true,
      schema,
      debug: {
        step: "STEP1_SCHEMA",
        prompt,
      },
    },
    { status: 200 },
  );
}