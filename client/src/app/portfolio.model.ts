export interface Profile {
  name: string;
  title: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  yearsOfExperience: number;
}

export interface Stat {
  value: string;
  label: string;
}

export interface SkillGroup {
  area: string;
  items: string[];
}

export interface Link {
  label: string;
  url: string;
}

export interface OpenSourceLibrary {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  install: string;
  links: Link[];
}

export interface Product {
  name: string;
  kind: string;
  description: string;
  features: string[];
  url: string;
  urlLabel: string;
}

export interface ExperienceProject {
  name: string;
  description: string;
  stack: string;
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  summary: string;
  projects: ExperienceProject[];
}

export interface Education {
  title: string;
  place: string;
}

export interface Portfolio {
  profile: Profile;
  stats: Stat[];
  skills: SkillGroup[];
  openSource: OpenSourceLibrary[];
  products: Product[];
  experience: Experience[];
  education: Education[];
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}
