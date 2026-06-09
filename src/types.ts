export type Lang = 'en' | 'es';

export interface FeedbackForm {
  category: string;
  businessType: string;
  why: string;
  contact: string;
  lang: Lang;
}

export interface Translations {
  nav: {
    community: string;
    forOperators: string;
    resources: string;
    login: string;
    signUp: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    body: string;
    cta: string;
    networkLabel: string;
    networkCenter: string;
  };
  form: {
    title: string;
    subtitle: string;
    location: string;
    locationPlaceholder: string;
    locationHint: string;
    locationConfirmed: string;
    category: string;
    categoryPlaceholder: string;
    businessType: string;
    businessTypePlaceholder: string;
    why: string;
    whyPlaceholder: string;
    contact: string;
    contactPlaceholder: string;
    submit: string;
    required: string;
    invalidEmail: string;
  };
  categories: string[];
  success: {
    title: string;
    body: string;
    back: string;
  };
  sign: {
    title: string;
    tagline: string;
    download: string;
    back: string;
  };
}
