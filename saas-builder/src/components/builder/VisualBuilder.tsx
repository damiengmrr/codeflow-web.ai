"use client";
import { LivePreview } from "./LivePreview";
import { useEffect, useMemo, useState } from "react";
import type {
  WebsiteSchema,
  Page,
  Section,
  SectionType,
} from "@/lib/schema/types";
import type { ProjectBrief } from "@/lib/ai/prompts";

type VisualBuilderProps = {
  projectId: string;
  initialSchema: WebsiteSchema;
};

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  features: "Features",
  services: "Services",
  testimonials: "Testimonials",
  pricing: "Pricing",
  faq: "FAQ",
  cta: "CTA",
  contact: "Contact",
  gallery: "Galerie",
};

const SECTION_TYPES_IN_ORDER: SectionType[] = [
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createDefaultSection(type: SectionType): Section {
  const id = `sec-${type}-${Math.random().toString(36).slice(2, 8)}`;

  switch (type) {
    case "hero":
      return {
        id,
        type,
        props: {
          headline: "Titre principal",
          subheadline: "Sous-titre de présentation",
          ctaPrimary: "Call to action",
          ctaSecondary: "En savoir plus",
          image: "/images/hero.jpg",
        },
      };
    case "features":
      return {
        id,
        type,
        props: {
          title: "Nos points forts",
          items: [
            {
              title: "Feature 1",
              description: "Une explication rapide de ce point fort.",
            },
            {
              title: "Feature 2",
              description: "Un second élément de valeur.",
            },
          ],
        },
      };
    case "services":
      return {
        id,
        type,
        props: {
          title: "Nos services",
          items: [
            {
              name: "Service 1",
              description: "Description courte du service.",
            },
          ],
        },
      };
    case "testimonials":
      return {
        id,
        type,
        props: {
          title: "Ils nous font confiance",
          items: [
            {
              name: "Client 1",
              quote: "Un témoignage client.",
              role: "Fonction",
            },
          ],
        },
      };
    case "pricing":
      return {
        id,
        type,
        props: {
          title: "Nos offres",
          plans: [
            {
              name: "Starter",
              price: "49€",
              features: ["Feature A", "Feature B"],
              highlight: true,
            },
          ],
        },
      };
    case "faq":
      return {
        id,
        type,
        props: {
          title: "FAQ",
          items: [
            { question: "Question fréquente ?", answer: "Réponse pertinente." },
          ],
        },
      };
    case "cta":
      return {
        id,
        type,
        props: {
          title: "Prêt à commencer ?",
          text: "Contacte-nous pour lancer ton projet.",
          buttonLabel: "Nous contacter",
        },
      };
    case "contact":
      return {
        id,
        type,
        props: {
          title: "Contact",
          description: "Laisse-nous un message, on revient vers toi.",
        },
      };
    case "gallery":
      return {
        id,
        type,
        props: {
          title: "Galerie",
          images: [
            { src: "/images/sample-1.jpg", alt: "Image 1" },
            { src: "/images/sample-2.jpg", alt: "Image 2" },
          ],
        },
      };
    default:
      return {
        id,
        type,
        props: {},
      };
  }
}

export default function VisualBuilder({
  projectId,
  initialSchema,
}: VisualBuilderProps) {

  const [schema, setSchema] = useState<WebsiteSchema>(initialSchema);
  const [currentPageSlug, setCurrentPageSlug] = useState<string | null>(
    initialSchema.website.pages[0]?.slug ?? null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // UI state for panel toggles
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showRawProps, setShowRawProps] = useState(true);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const pages = schema.website.pages;

  const currentPage: Page | null = useMemo(() => {
    if (!currentPageSlug) return pages[0] ?? null;
    return pages.find((p) => p.slug === currentPageSlug) ?? pages[0] ?? null;
  }, [currentPageSlug, pages]);

  const sections: Section[] = currentPage?.sections ?? [];

  const selectedSection: Section | null =
    sections.find((s) => s.id === selectedSectionId) ?? null;

  function handleSelectPage(slug: string) {
    setCurrentPageSlug(slug);
    setSelectedSectionId(null);
  }

  function handleAddPage() {
    const title = window.prompt("Titre de la nouvelle page ?", "Nouvelle page");
    if (!title) return;

    const slug = slugify(title);

    const exists = schema.website.pages.some((p) => p.slug === slug);
    if (exists) {
      alert("Une page avec ce slug existe déjà.");
      return;
    }

    const newPage: Page = {
      slug,
      title,
      sections: [],
    };

    setSchema((prev) => ({
      ...prev,
      website: {
        ...prev.website,
        pages: [...prev.website.pages, newPage],
      },
    }));

    setCurrentPageSlug(slug);
    setSelectedSectionId(null);
  }

  function handleAddSection(type: SectionType) {
    if (!currentPage) return;

    const newSection = createDefaultSection(type);

    setSchema((prev) => ({
      ...prev,
      website: {
        ...prev.website,
        pages: prev.website.pages.map((p) =>
          p.slug === currentPage.slug
            ? { ...p, sections: [...p.sections, newSection] }
            : p,
        ),
      },
    }));

    setSelectedSectionId(newSection.id);
  }

  function handleRemoveSection(sectionId: string) {
    if (!currentPage) return;

    setSchema((prev) => ({
      ...prev,
      website: {
        ...prev.website,
        pages: prev.website.pages.map((p) =>
          p.slug === currentPage.slug
            ? {
                ...p,
                sections: p.sections.filter((s) => s.id !== sectionId),
              }
            : p,
        ),
      },
    }));

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  }

  function updateSelectedSectionProps(partialProps: Record<string, any>) {
    if (!currentPage || !selectedSection) return;

    const sectionId = selectedSection.id;

    setSchema((prev) => ({
      ...prev,
      website: {
        ...prev.website,
        pages: prev.website.pages.map((p) =>
          p.slug === currentPage.slug
            ? {
                ...p,
                sections: p.sections.map((s) =>
                  s.id === sectionId
                    ? { ...s, props: { ...s.props, ...partialProps } }
                    : s,
                ),
              }
            : p,
        ),
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/projects/${projectId}/schema`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schema }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erreur lors de la sauvegarde.");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error: any) {
      console.error("Error saving schema:", error);
      setSaveError(error?.message ?? "Erreur inconnue.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateWithAI() {
    setIaLoading(true);
    setIaError(null);

    try {
      const brief: ProjectBrief = {
        projectName: schema.website.name,
        businessType: "Site vitrine",
        mainGoal: "Présenter le business et générer des prises de contact",
        tone: "professionnel",
        styleKeywords: ["modern", "clean", "premium"],
        pagesWanted: ["home", "services", "about", "contact"],
        primaryColor: schema.website.colors.primary,
        secondaryColor: schema.website.colors.secondary,
      };

      const res = await fetch("/api/generate/schema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brief }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erreur génération IA.");
      }

      const data = await res.json();

      if (!data.schema) {
        throw new Error("Réponse IA invalide (schema manquant).");
      }

      const newSchema = data.schema as WebsiteSchema;
      setSchema(newSchema);
      setCurrentPageSlug(newSchema.website.pages[0]?.slug ?? null);
      setSelectedSectionId(null);
    } catch (error: any) {
      console.error("Error generating schema with AI:", error);
      setIaError(error?.message ?? "Erreur IA.");
    } finally {
      setIaLoading(false);
    }
  }

  async function handleGenerateContentWithAI() {
    setIaLoading(true);
    setIaError(null);

    try {
      const res = await fetch("/api/generate/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schema }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erreur génération contenu IA.");
      }

      const data = await res.json();

      if (!data.schema) {
        throw new Error("Réponse IA invalide (schema manquant).");
      }

      const newSchema = data.schema as WebsiteSchema;
      setSchema(newSchema);
      // On garde la page et la section sélectionnées si possible, donc pas de reset ici
    } catch (error: any) {
      console.error("Error generating content with AI:", error);
      setIaError(error?.message ?? "Erreur IA (contenu).");
    } finally {
      setIaLoading(false);
    }
  }

  async function handleExportCodeZip() {
    setExporting(true);
    setExportError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/generate/code`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error ?? "Erreur lors de la génération du ZIP.",
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName =
        schema.website.name?.toLowerCase().replace(/[^a-z0-9-]/g, "-") ||
        "site-generated";
      a.download = `${safeName}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error exporting code ZIP:", error);
      setExportError(error?.message ?? "Erreur export ZIP.");
    } finally {
      setExporting(false);
    }
  }

  const ui = (
    <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Top bar (Wix-like) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600" />
              <div className="leading-tight">
                <div className="text-[12px] font-semibold">SaaS Builder</div>
                <div className="text-[10px] text-slate-500">{schema.website.name}</div>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <div className="h-5 w-px bg-slate-200" />
              <div className="text-[11px] text-slate-500">Édition du projet</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {iaError && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-800">
                {iaError}
              </span>
            )}
            {saveError && (
              <span className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-red-700">
                {saveError}
              </span>
            )}
            {saveSuccess && (
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-700">
                Sauvegardé
              </span>
            )}
            {exportError && (
              <span className="rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-orange-700">
                {exportError}
              </span>
            )}

            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={iaLoading || saving || exporting}
              className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 font-medium text-purple-800 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {iaLoading ? "Génération..." : "Générer structure IA"}
            </button>

            <button
              type="button"
              onClick={handleGenerateContentWithAI}
              disabled={iaLoading || saving || exporting}
              className="rounded-full border border-pink-300 bg-pink-50 px-3 py-1 font-medium text-pink-800 transition hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {iaLoading ? "Génération..." : "Générer contenu IA"}
            </button>

            <button
              type="button"
              onClick={handleExportCodeZip}
              disabled={saving || iaLoading || exporting}
              className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? "Export..." : "Exporter le code (ZIP)"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || exporting}
              className="rounded-full bg-blue-600 px-3 py-1 font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>

            <button
              type="button"
              onClick={() => setShowJson((v) => !v)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {showJson ? "Masquer JSON" : "Afficher JSON"}
            </button>
          </div>
        </div>

        {/* Pages row */}
        <div className="border-t border-slate-100 bg-white">
          <div className="flex flex-wrap items-center gap-2 px-4 py-2">
            {pages.map((page) => (
              <button
                key={page.slug}
                type="button"
                onClick={() => handleSelectPage(page.slug)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  currentPage?.slug === page.slug
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {page.title}{" "}
                <span className="font-mono text-[10px] text-slate-400">/{page.slug}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={handleAddPage}
              className="rounded-full border border-dashed border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              + Ajouter une page
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeftCollapsed((v) => !v)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-50"
              >
                {leftCollapsed ? "Afficher panneau" : "Masquer panneau"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRightCollapsed((v) => {
                    const next = !v;
                    if (next) setSelectedSectionId(null);
                    return next;
                  });
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-50"
              >
                {rightCollapsed ? "Afficher inspector" : "Masquer inspector"}
              </button>

              <button
                type="button"
                onClick={() => setShowRawProps((v) => !v)}
                className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-50 lg:inline-flex"
              >
                {showRawProps ? "Masquer props" : "Afficher props"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex h-full w-full flex-col">
        {/* Editor shell (fills the entire viewport, no outer margins) */}
        <div className="flex min-h-0 w-full flex-1">
        {/* Left: vertical tool bar + panel */}
        <aside className="flex shrink-0">
          {/* Icon rail */}
          <div className="flex h-full w-14 flex-col items-center gap-2 border-r border-slate-200 bg-white py-3">
            <button
              type="button"
              onClick={() => setLeftCollapsed(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              title="Pages & Sections"
            >
              <span className="text-lg">☰</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSectionId(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              title="Sélection"
            >
              <span className="text-lg">⌖</span>
            </button>
            <button
              type="button"
              onClick={() => setShowJson(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              title="JSON"
            >
              <span className="text-lg">{"{}"}</span>
            </button>
            <div className="mt-auto" />
            <button
              type="button"
              onClick={() => setLeftCollapsed((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              title={leftCollapsed ? "Ouvrir" : "Fermer"}
            >
              <span className="text-lg">{leftCollapsed ? "›" : "‹"}</span>
            </button>
          </div>

          {/* Panel */}
          {!leftCollapsed && (
            <div className="flex h-full w-[360px] flex-col border-r border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold">Sections</h2>
                <p className="text-[11px] text-slate-500">
                  Page actuelle : <span className="font-mono text-slate-700">/{currentPage?.slug ?? "–"}</span>
                </p>
              </div>

              <div className="flex-1 overflow-auto px-4 py-4">
                {sections.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Aucune section pour l’instant. Ajoute un bloc ci-dessous.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li
                        key={section.id}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition ${
                          selectedSectionId === section.id
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <button
                          type="button"
                          className="flex flex-1 flex-col items-start text-left"
                          onClick={() => setSelectedSectionId(section.id)}
                        >
                          <span className="font-semibold">
                            {SECTION_TYPE_LABELS[section.type] ?? section.type}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{section.id}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(section.id)}
                          className="text-[10px] text-slate-500 hover:text-red-600"
                        >
                          Suppr.
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="mb-2 text-[11px] font-semibold text-slate-700">Ajouter une section</p>
                  <div className="flex flex-wrap gap-2">
                    {SECTION_TYPES_IN_ORDER.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleAddSection(type)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        {SECTION_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center: canvas (Wix-like full workspace) */}
        <main className="min-w-0 flex-1 bg-white">
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
            {/* Canvas top mini-bar */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">Aperçu en direct</div>
                  <div className="text-[11px] text-slate-500">Read-only • basé sur le schema</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700">
                    Page : <span className="font-mono text-slate-900">/{currentPage?.slug ?? "–"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Workspace area */}
            <div className="min-h-0 flex-1 overflow-auto bg-white">
              {/* Canvas (full width / full height like Wix) */}
              <div className="min-h-full w-full bg-white">
                <div className="h-full w-full bg-white">
                  <LivePreview schema={schema} currentPageSlug={currentPageSlug} />
                </div>
              </div>

              {/* JSON panel (full-width) */}
              {showJson && (
                <div className="border-t border-slate-200 bg-white px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[11px] font-semibold text-slate-700">Schema JSON complet</h3>
                    <button
                      type="button"
                      onClick={() => setShowJson(false)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Fermer
                    </button>
                  </div>
                  <pre className="max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] text-slate-700">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right: inspector (full height, not floating) */}
        {!rightCollapsed && (
          <aside className="h-full w-[420px] shrink-0 border-l border-slate-200 bg-white">
            <div className="flex h-full flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Inspector</div>
                  <div className="text-[11px] text-slate-500">Édite les props (bientôt full UI)</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawProps((v) => !v)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {showRawProps ? "Masquer props" : "Afficher props"}
                </button>
              </div>

              <div className="flex-1 overflow-auto px-4 py-4">
                {!selectedSection ? (
                  <p className="text-xs text-slate-500">Sélectionne une section pour la modifier.</p>
                ) : selectedSection.type === "hero" ? (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-500">
                      Type : <span className="font-mono text-slate-800">{selectedSection.type}</span>
                    </p>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Headline</label>
                      <input
                        value={selectedSection.props.headline ?? ""}
                        onChange={(e) => updateSelectedSectionProps({ headline: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">Subheadline</label>
                      <textarea
                        rows={5}
                        value={selectedSection.props.subheadline ?? ""}
                        onChange={(e) => updateSelectedSectionProps({ subheadline: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">CTA primaire</label>
                        <input
                          value={selectedSection.props.ctaPrimary ?? ""}
                          onChange={(e) => updateSelectedSectionProps({ ctaPrimary: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">CTA secondaire</label>
                        <input
                          value={selectedSection.props.ctaSecondary ?? ""}
                          onChange={(e) => updateSelectedSectionProps({ ctaSecondary: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                ) : showRawProps ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500">
                      Type : <span className="font-mono text-slate-800">{selectedSection.type}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Édition détaillée pas encore implémentée. Props brutes :</p>
                    <pre className="max-h-[520px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] text-slate-700">
                      {JSON.stringify(selectedSection.props, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        )}
        </div>
      </div>
    </div>
  );

  return ui;
}
