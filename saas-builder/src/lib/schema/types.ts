// src/lib/schema/types.ts

export type SectionType =
  | "hero"
  | "features"
  | "services"
  | "testimonials"
  | "pricing"
  | "faq"
  | "cta"
  | "contact"
  | "gallery";

export type SectionProps = Record<string, any>;

export interface Section {
  id: string;
  type: SectionType;
  props: SectionProps;
}

export interface Page {
  slug: string;      // "home", "services", "contact", etc.
  title: string;     // "Accueil", "Nos services", ...
  sections: Section[];
}

export interface WebsiteMeta {
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface WebsiteSchema {
  website: WebsiteMeta & {
    pages: Page[];
  };
}