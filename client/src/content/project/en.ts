import { PROJECTS_DATA } from "@/config/projects";
import type { ProjectContent } from "./vi";

const byId = Object.fromEntries(PROJECTS_DATA.map((p) => [p.id, p]));

export const projectEn: ProjectContent = {
  ui: {
    badge: "Products",
    title: "Featured Projects",
    description:
      "Explore the products and systems I have personally architected and delivered throughout my career.",
    prev: "Previous",
    next: "Next",
    yearLabel: "YEAR /",
    viewProject: "View project details: {title}",
    thumbAlt: "{title}",
    team: "Team & Role",
    period: "Timeline",
    stack: "Tech Stack",
    live: "Visit Live Site",
    source: "Explore Source Code",
  },
  items: [
    {
      ...byId["shopsifu"],
      title: "ShopSifu E-commerce Platform",
      summary:
        "A multi-channel e-commerce platform (Client, Admin, Seller) with role-based access control (RBAC), payments (VNPay, Sepay) and Socket.IO.",
      year: "May 2025 - Aug 2025",
      role: "Fullstack Developer",
      content: `A complex e-commerce platform with three large user flows, closely following RBAC business rules.

### The Problem
The system needed a real-time, multi-channel order processing solution for thousands of users, letting sellers list products and receive automatic payments without manual reconciliation.

### Technical Solution
- **Backend architecture:** A clean Controller - Service - Repository layering in NestJS, with strict transaction management during payment.
- **Realtime:** WebSocket (Socket.IO) combined with Redis Pub/Sub to push order notifications to the client instantly, in under 50ms.
- **Payment gateways:** Direct integration with the VNPay API and Sepay (webhooks that automatically verify bank transactions).
- **Optimized frontend:** Next.js Server Components combined with Redux Toolkit for a smooth local cart experience, minimizing re-renders.

![ShopSifu Admin Dashboard](/images/projects/shopsifu.webp)
*(Illustration of the admin dashboard flow)*`,
    },
    {
      ...byId["song-ngu-lac-hong"],
      title: "Lac Hong Bilingual School System",
      summary:
        "A multi-domain school system built on a Turborepo architecture that shares UI components (ShadCN). Fully SEO-optimized and responsive.",
      year: "Nov 2025 - Mar 2026",
      role: "Frontend Team Lead",
      content: `An education infrastructure ecosystem covering Kindergarten, Primary and Secondary school.

### The Problem
The client representative asked for a web ecosystem split across 4 separate domains serving 4 different audiences, while making the most of one shared Design System to keep the brand identity perfectly consistent.

### Architecture & Implementation
- **Monorepo with Turborepo:** Consolidated all scattered codebases into one large repository, creating shared packages such as \`ui-components\`, \`configs\` and \`utils\`.
- **UI system:** Deep customization of ShadCN UI and Tailwind CSS, with a fully dynamic theme based on the marketing team's color guidelines.
- **SSG performance & SEO:** Used Next.js static generation for very fast page loads (PageSpeed Insights consistently above 95) and SEO-ready meta tags for advertising campaigns.`,
    },
  ],
};
