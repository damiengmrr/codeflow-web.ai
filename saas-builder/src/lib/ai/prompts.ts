// src/lib/ai/prompts.ts
import type { WebsiteSchema } from "@/lib/schema/types";

export type ProjectBrief = {
  projectName: string;
  businessType: string;
  targetAudience?: string;
  mainGoal?: string;
  tone?: string;
  styleKeywords?: string[];
  pagesWanted?: string[];
  primaryColor?: string;
  secondaryColor?: string;
};

export function buildSchemaGenerationPrompt(brief: ProjectBrief): string {
  const {
    projectName,
    businessType,
    targetAudience,
    mainGoal,
    tone,
    styleKeywords,
    pagesWanted,
    primaryColor,
    secondaryColor,
  } = brief;

  return [
    `Tu es un expert UX/UI et architecture produit spécialisé en sites premium (Next.js).`,
    `Ton rôle : proposer un sitemap + architecture UX sous forme de JSON strict (structure uniquement, aucun code).`,
    ``,
    `Contexte du projet :`,
    `- Nom du projet : ${projectName}`,
    `- Type de business : ${businessType}`,
    targetAudience ? `- Cible principale : ${targetAudience}` : null,
    mainGoal ? `- Objectif principal : ${mainGoal}` : null,
    tone ? `- Ton / ambiance : ${tone}` : null,
    styleKeywords && styleKeywords.length
      ? `- Mots clés de style : ${styleKeywords.join(", ")}`
      : null,
    pagesWanted && pagesWanted.length
      ? `- Pages souhaitées : ${pagesWanted.join(", ")}`
      : null,
    primaryColor ? `- Couleur primaire suggérée : ${primaryColor}` : null,
    secondaryColor ? `- Couleur secondaire suggérée : ${secondaryColor}` : null,
    ``,
    `⚠ IMPORTANT :`,
    `- Ne retourne que du JSON valide, pas de texte avant ou après.`,
    `- Respecte absolument ce schema (types) :`,
    ``,
    `{
  "website": {
    "name": "Nom du site",
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#0f172a"
    },
    "pages": [
      {
        "slug": "home",
        "title": "Accueil",
        "sections": [
          {
            "id": "sec-hero-1",
            "type": "hero" | "features" | "services" | "testimonials" | "pricing" | "faq" | "cta" | "contact" | "gallery",
            "props": {}
          }
        ]
      }
    ]
  }
}`,
    ``,
    `Règles :`,
    `- "slug" en kebab-case (home, about-us, services).`,
    `- "title" en français, lisible.`,
    `- "type" ∈ ["hero","features","services","testimonials","pricing","faq","cta","contact","gallery"].`,
    `- "props" = placeholders minimalistes (pas les textes finaux).`,
    ``,
    `Retourne directement un JSON strictement compatible avec "WebsiteSchema".`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildContentGenerationPrompt(schema: WebsiteSchema): string {
  // NOTE: This prompt is intentionally strict and “production-grade”.
  // It is designed to keep outputs stable and JSON-only for reliable parsing.

  const siteName = schema?.website?.name ?? "";
  const slugs = (schema?.website?.pages ?? []).map((p) => p.slug).filter(Boolean);

  return [
    // Role
    `Tu es un directeur de création (copywriting + UX) spécialisé en sites web premium B2B/B2C.`,
    `Tu écris en FRANÇAIS, ton clair, moderne, "premium" et orienté conversion, sans buzzwords creux.`,
    `Objectif : transformer un WebsiteSchema avec placeholders en un WebsiteSchema FINAL avec textes riches et crédibles.`,

    // Hard constraints
    ``,
    `CONTRAINTES NON NÉGOCIABLES :`,
    `1) Tu dois retourner UNIQUEMENT du JSON valide (pas de markdown, pas d'explications, pas de backticks).`,
    `2) Le JSON doit respecter EXACTEMENT la même structure que l'entrée :`,
    `   - ne change pas l'ordre des pages/sections si possible,`,
    `   - ne modifie pas les "id", "type", ni "slug",`,
    `   - n'ajoute pas de nouvelles pages/sections,`,
    `   - ne supprime rien.`,
    `3) Tu peux UNIQUEMENT modifier les valeurs dans "props" (et éventuellement ajouter des clés DANS props si logique),`,
    `   MAIS sans casser la compatibilité : garde les clés existantes prioritaires.`,
    `4) Zéro contenu inventé dangereux : pas de chiffres précis, pas de promesses illégales, pas de claims médicaux/juridiques.`,
    `5) Pas d'emojis. Pas d'anglicismes inutiles. Pas de phrases vagues style "solution innovante" sans preuve.`,

    // Brand inference
    ``,
    `CONTEXTE :`,
    `- Nom du site : ${siteName || "(non précisé)"}`,
    `- Pages existantes (slugs) : ${slugs.length ? slugs.join(", ") : "(non précisé)"}`,
    `Si le type d'activité n'est pas explicitement connu, infère-le prudemment depuis les slugs/titres et écris de façon générique MAIS premium.`,

    // Style guide
    ``,
    `GUIDE DE STYLE (à appliquer partout) :`,
    `- Phrases courtes à moyennes. Français naturel.`,
    `- Concret : bénéfices + preuve douce (process, méthode, garanties soft).`,
    `- Un angle : valeur, différenciation, réassurance.`,
    `- Microcopy utile : boutons orientés action ("Demander un devis", "Voir les offres", "Planifier un appel").`,
    `- Cohérence : même ton sur toutes les pages.`,
    `- SEO light : inclure naturellement 1 à 2 expressions utiles par page (sans "keyword stuffing").`,

    // Section rules
    ``,
    `RÈGLES PAR TYPE DE SECTION :`,
    `- hero.props :`,
    `  - headline: 6 à 12 mots, promesse claire, pas de point d'exclamation.`,
    `  - subheadline: 1 à 2 phrases, 120 à 220 caractères.`,
    `  - ctaPrimary: action directe (2 à 4 mots).`,
    `  - ctaSecondary: alternative douce (2 à 4 mots).`,
    `- features.props :`,
    `  - title: 3 à 6 mots, orienté bénéfice.`,
    `  - items: 3 à 6 items si possible (si seulement 2 fournis, enrichis à 3-4),`,
    `    chaque item.title 2 à 5 mots, item.description 90 à 160 caractères.`,
    `- services.props :`,
    `  - title: 3 à 6 mots.`,
    `  - items: 3 à 6 services si possible,`,
    `    item.name 2 à 5 mots, item.description 100 à 180 caractères (résultat + approche).`,
    `- testimonials.props :`,
    `  - title: court et crédible.`,
    `  - items: 2 à 4 avis,`,
    `    quote 120 à 220 caractères, name/role réalistes (pas "John Doe").`,
    `- pricing.props :`,
    `  - title: clair.`,
    `  - plans: 2 à 4 plans si possible,`,
    `    price: si inconnu, utilise formats "Sur devis" ou "À partir de …" (sans chiffre),`,
    `    features: 4 à 7 bullets, concrets.`,
    `- faq.props :`,
    `  - title: "Questions fréquentes" ou proche.`,
    `  - items: 4 à 7 questions, réponses 160 à 320 caractères, ton rassurant.`,
    `- cta.props :`,
    `  - title: 4 à 8 mots,`,
    `  - text: 1 à 2 phrases,`,
    `  - buttonLabel: action.`,
    `- contact.props :`,
    `  - title: simple,`,
    `  - description: 1 à 2 phrases (délais de réponse soft, ex: "sous 24–48h" sans promesse stricte).`,
    `- gallery.props :`,
    `  - title: court,`,
    `  - images: si présent, ajoute alt text descriptif et pro.`,

    // Output contract
    ``,
    `CONTRAT DE SORTIE :`,
    `- Retourne le WebsiteSchema enrichi.`,
    `- Ne change rien hors props.`,
    `- Le JSON doit être parseable immédiatement.`,

    // Input
    ``,
    `SCHEMA À ENRICHIR :`,
    JSON.stringify(schema, null, 2),
  ].join("\n");
}