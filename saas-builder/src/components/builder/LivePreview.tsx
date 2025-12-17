"use client";

import type { WebsiteSchema } from "@/lib/schema/types";

type LivePreviewProps = {
  schema: WebsiteSchema;
  currentPageSlug: string | null;
};

type Section = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
};

type FeatureItem = { title?: string; description?: string };
type ServiceItem = { name?: string; description?: string };
type PricingPlan = {
  name?: string;
  price?: string;
  highlight?: boolean;
  features?: string[];
};
type FaqItem = { question?: string; answer?: string };
type GalleryImage = { alt?: string };

function renderSection(section: Section) {
  const type = section.type;
  const props = (section.props ?? {}) as Record<string, unknown>;

  if (type === "hero") {
    const headline = (props.headline as string | undefined) ?? "Titre principal";
    const subheadline =
      (props.subheadline as string | undefined) ?? "Sous-titre de présentation.";
    const ctaPrimary = props.ctaPrimary as string | undefined;
    const ctaSecondary = props.ctaSecondary as string | undefined;

    return (
      <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {headline}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            {subheadline}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {ctaPrimary && (
              <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500">
                {ctaPrimary}
              </button>
            )}
            {ctaSecondary && (
              <button className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50">
                {ctaSecondary}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "features") {
    const title = (props.title as string | undefined) ?? "Nos points forts";
    const items = (Array.isArray(props.items) ? (props.items as FeatureItem[]) : []) as FeatureItem[];

    return (
      <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {items.map((item: FeatureItem, idx: number) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title ?? `Point fort ${idx + 1}`}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description ?? "Un avantage clé mis en avant."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (type === "services") {
    const title = (props.title as string | undefined) ?? "Nos services";
    const items = (Array.isArray(props.items) ? (props.items as ServiceItem[]) : []) as ServiceItem[];

    return (
      <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {items.map((item: ServiceItem, idx: number) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.name ?? `Service ${idx + 1}`}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description ?? "Description courte et claire du service."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (type === "cta") {
    const title = (props.title as string | undefined) ?? "Prêt à commencer ?";
    const text =
      (props.text as string | undefined) ??
      "Une phrase courte qui pousse à l'action, simple et efficace.";
    const buttonLabel = props.buttonLabel as string | undefined;

    return (
      <section key={section.id} className="rounded-2xl border border-blue-200 bg-blue-50 p-8 shadow-sm">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {text}
          </p>
          {buttonLabel && (
            <button className="mt-6 rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500">
              {buttonLabel}
            </button>
          )}
        </div>
      </section>
    );
  }

  if (type === "pricing") {
    const title = (props.title as string | undefined) ?? "Nos offres";
    const plans = (Array.isArray(props.plans) ? (props.plans as PricingPlan[]) : []) as PricingPlan[];

    return (
      <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {plans.map((plan: PricingPlan, idx: number) => (
              <div
                key={idx}
                className={
                  "rounded-2xl border p-6 " +
                  (plan.highlight
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-slate-50")
                }
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {plan.name ?? `Plan ${idx + 1}`}
                </h3>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {plan.price ?? "—"}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {(plan.features ?? []).map((f: string, i: number) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (type === "faq") {
    const title = (props.title as string | undefined) ?? "FAQ";
    const items = (Array.isArray(props.items) ? (props.items as FaqItem[]) : []) as FaqItem[];

    return (
      <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <div className="mt-5 space-y-3">
            {items.map((item: FaqItem, idx: number) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  {item.question ?? `Question ${idx + 1}`}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.answer ?? "Réponse pertinente."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (type === "contact") {
    const title = (props.title as string | undefined) ?? "Contact";
    const description =
      (props.description as string | undefined) ??
      "Laisse-nous un message, on te répond rapidement.";

    return (
      <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {description}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              • Formulaire de contact à intégrer ici
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              • Coordonnées, réseaux sociaux, etc.
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (type === "gallery") {
    const title = (props.title as string | undefined) ?? "Galerie";
    const images = (Array.isArray(props.images) ? (props.images as GalleryImage[]) : []) as GalleryImage[];

    return (
      <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {images.map((img: GalleryImage, idx: number) => (
              <div
                key={idx}
                className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500"
              >
                {img.alt ?? "Image de projet"}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return null;
}

export function LivePreview({ schema, currentPageSlug }: LivePreviewProps) {
  const pages = (schema.website?.pages ?? []) as Array<{
    title: string;
    slug: string;
    sections: Section[];
  }>;

  const page =
    (currentPageSlug && pages.find((p) => p.slug === currentPageSlug)) ||
    pages[0] ||
    null;

  if (!page) {
    return (
      <div className="h-full w-full overflow-auto bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Aucun contenu pour le moment. Ajoute une page et des sections pour voir
          l’aperçu ici.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-slate-100">
      {/* "Canvas" header (light, like editors) */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-none items-center justify-between gap-3 px-6 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900">Aperçu en direct</p>
            <p className="truncate text-xs text-slate-500">
              Page <span className="font-medium text-slate-900">{page.title}</span> (
              <span className="font-mono">{page.slug}</span>)
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
            Read-only • basé sur le schema
          </span>
        </div>
      </div>

      {/* Full-width canvas content */}
      <div className="px-6 py-6">
        <div className="mx-auto max-w-none space-y-6">
          {page.sections.map((section: Section) => renderSection(section))}
        </div>
      </div>
    </div>
  );
}