// src/app/api/generate/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { WebsiteSchema } from "@/lib/schema/types";
import { buildContentGenerationPrompt } from "@/lib/ai/prompts";

// Juste pour éviter les réponses vides trop "génériques"
function enrichText(base: string, extra: string): string {
  return `${base} ${extra}`.trim();
}

// Pour l'instant, on simule le comportement de l'IA :
// on prend le schema existant et on "développe" un peu les textes.
function enrichSchemaContent(schema: WebsiteSchema): WebsiteSchema {
  const websiteName = schema.website.name;

  return {
    ...schema,
    website: {
      ...schema.website,
      pages: schema.website.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) => {
          const props = section.props ?? {};

          switch (section.type) {
            case "hero": {
              const headline =
                props.headline ??
                `Bienvenue sur ${websiteName}`;
              const subheadline =
                props.subheadline ??
                "Découvrez notre univers et ce que nous pouvons faire pour vous.";
              const ctaPrimary =
                props.ctaPrimary ?? "Demander un devis";
              const ctaSecondary =
                props.ctaSecondary ?? "Voir nos services";

              return {
                ...section,
                props: {
                  ...props,
                  headline: enrichText(
                    headline,
                    "— une solution claire et moderne pour ton projet.",
                  ),
                  subheadline: enrichText(
                    subheadline,
                    "Nous t’aidons à gagner en crédibilité, en visibilité et en conversions.",
                  ),
                  ctaPrimary,
                  ctaSecondary,
                },
              };
            }

            case "features": {
              const title = props.title ?? "Pourquoi nous choisir ?";
              const items =
                props.items && Array.isArray(props.items) && props.items.length
                  ? props.items
                  : [
                      {
                        title: "Accompagnement personnalisé",
                        description:
                          "Un suivi humain, transparent et orienté résultats.",
                      },
                      {
                        title: "Technologies modernes",
                        description:
                          "Une stack technique fiable, performante et maintenable.",
                      },
                    ];
              return {
                ...section,
                props: {
                  ...props,
                  title,
                  items: items.map((item: any, index: number) => ({
                    ...item,
                    description:
                      item.description ??
                      (index === 0
                        ? "Un avantage concret pour ton activité."
                        : "Un véritable levier de croissance."),
                  })),
                },
              };
            }

            case "services": {
              const title = props.title ?? "Nos services";
              const items =
                props.items && Array.isArray(props.items) && props.items.length
                  ? props.items
                  : [
                      {
                        name: "Création de site web",
                        description:
                          "Un site moderne, responsive et optimisé pour la conversion.",
                      },
                    ];
              return {
                ...section,
                props: {
                  ...props,
                  title,
                  items: items.map((item: any) => ({
                    ...item,
                    description:
                      item.description ??
                      "Un service pensé pour répondre à un besoin précis de tes clients.",
                  })),
                },
              };
            }

            case "testimonials": {
              const title = props.title ?? "Ils nous font confiance";
              const items =
                props.items && Array.isArray(props.items) && props.items.length
                  ? props.items
                  : [
                      {
                        name: "Client satisfait",
                        quote:
                          "Un accompagnement sérieux et efficace, du début à la fin.",
                        role: "Entrepreneur",
                      },
                    ];
              return {
                ...section,
                props: {
                  ...props,
                  title,
                  items,
                },
              };
            }

            case "pricing": {
              const title = props.title ?? "Nos offres";
              const plans =
                props.plans && Array.isArray(props.plans) && props.plans.length
                  ? props.plans
                  : [
                      {
                        name: "Starter",
                        price: "49€",
                        features: [
                          "Présence en ligne professionnelle",
                          "Design responsive",
                        ],
                        highlight: true,
                      },
                    ];
              return {
                ...section,
                props: {
                  ...props,
                  title,
                  plans,
                },
              };
            }

            case "faq": {
              const title = props.title ?? "FAQ";
              const items =
                props.items && Array.isArray(props.items) && props.items.length
                  ? props.items
                  : [
                      {
                        question: "Comment se déroule un projet ?",
                        answer:
                          "On commence par un échange pour bien comprendre tes besoins, puis on passe en conception, développement et lancement.",
                      },
                    ];
              return {
                ...section,
                props: {
                  ...props,
                  title,
                  items,
                },
              };
            }

            case "cta": {
              const title = props.title ?? "Prêt à passer à la suite ?";
              const text =
                props.text ??
                "Parle-nous de ton projet et on construit ensemble la meilleure solution.";
              const buttonLabel =
                props.buttonLabel ?? "Planifier un appel";

              return {
                ...section,
                props: {
                  ...props,
                  title,
                  text,
                  buttonLabel,
                },
              };
            }

            case "contact": {
              const title = props.title ?? "Contact";
              const description =
                props.description ??
                "Remplis le formulaire ci-dessous, on revient vers toi très vite.";
              return {
                ...section,
                props: {
                  ...props,
                  title,
                  description,
                },
              };
            }

            case "gallery": {
              const title = props.title ?? "Nos réalisations";
              const images =
                props.images && Array.isArray(props.images) && props.images.length
                  ? props.images
                  : [
                      {
                        src: "/images/sample-1.jpg",
                        alt: "Exemple de projet réalisé",
                      },
                      {
                        src: "/images/sample-2.jpg",
                        alt: "Autre exemple de réalisation",
                      },
                    ];
              return {
                ...section,
                props: {
                  ...props,
                  title,
                  images,
                },
              };
            }

            default:
              return section;
          }
        }),
      })),
    },
  };
}

// POST /api/generate/content
export async function POST(req: NextRequest) {
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

  const schema = body.schema as WebsiteSchema;

  // On prépare le prompt (pour plus tard, quand on branchera Groq/Ollama)
  const prompt = buildContentGenerationPrompt(schema);

  // Pour l’instant, pas d’appel IA réel → enrichissement backend
  const enrichedSchema = enrichSchemaContent(schema);

  return NextResponse.json(
    {
      ok: true,
      schema: enrichedSchema,
      debug: {
        step: "STEP2_CONTENT",
        prompt,
      },
    },
    { status: 200 },
  );
}