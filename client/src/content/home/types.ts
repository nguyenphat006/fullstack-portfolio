import type {
  HomeContactContent, HomeEducationItem, HomeExperienceItem, HomeFeaturedProject, HomeHeroContent, HomeHeroStat,
  HomeNavLink, HomeSkillItem, HomeTestimonial,
} from "@/components/modules/home/types";

/** Chữ giao diện cố định của trang chủ, nhóm theo từng phần. */
export interface HomeUi {
  navbar: { logoLabel: string; navLabel: string };
  hero: {
    greeting: string;
    typed: [string, string];
    introName: string;
    introBody: string;
    avatarAlt: string;
    identityName: string;
    techEcosystem: string;
    techAlt: string;
    availableForWork: string;
    location: string;
    online: string;
  };
  experience: {
    badge: string; title: string; accent: string; description: string;
    viewDetails: string; website: string;
    modal: { close: string; noDetails: string; featuredProjects: string };
  };
  education: { badge: string; title: string; accent: string; description: string };
  skills: {
    badge: string; title: string; accent: string; description: string;
    learningJourney: string; techFocusTitle: string; techFocusBody: string; iconCloudLabel: string;
  };
  projects: {
    badge: string; title: string; accent: string; description: string;
    viewAll: string; viewDetail: string; sourceCode: string;
  };
  testimonials: { title: string; accent: string; description: string };
  contact: {
    nameLabel: string; namePlaceholder: string; emailLabel: string; emailPlaceholder: string;
    messageLabel: string; messagePlaceholder: string; submit: string; sending: string;
  };
}

export interface HomeContent {
  nav: HomeNavLink[];
  hero: HomeHeroContent;
  stats: HomeHeroStat[];
  experiences: HomeExperienceItem[];
  education: HomeEducationItem[];
  skills: HomeSkillItem[];
  projects: HomeFeaturedProject[];
  testimonials: HomeTestimonial[];
  contact: HomeContactContent;
  ui: HomeUi;
}
