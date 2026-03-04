import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Phat",
  lastName: "Nguyen",
  name: `Nguyen Dang Phat`,
  role: "Frontend Developer",
  avatar: "/images/logo-avat.png",
  email: "nguyendangphat1505@gmail.com",
  location: "Asia/Ho_Chi_Minh", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["Vietnamese", "English"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>Stay updated with my latest projects and tech insights</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  // Set essentials: true for links you want to show on the about page
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/nguyenphat006",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/ericss-ndp/",
    essential: true,
  },
  {
    name: "Instagram",
    icon: "instagram",
    link: "https://www.instagram.com/ericss_ndp/",
    essential: false,
  },
  {
    name: "Threads",
    icon: "threads",
    link: "https://www.threads.com/@ericss_ndp",
    essential: false,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Crafting seamless digital experiences with modern web technologies</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Shopsifu</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured project
        </Text>
      </Row>
    ),
    href: "/work/shopsifu-e-commerce-platform",
  },
  subline: (
    <>
      I'm Phat, a <Text as="span" size="xl" weight="strong">Frontend Developer</Text> with 1+ years of hands-on experience <br /> building scalable web apps from startups to enterprise systems.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from Bien Hoa, Dong Nai, Vietnam`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Frontend Developer with over 1 year of hands-on experience across diverse projects — from
        dynamic startups to large-scale government systems. Strong aesthetic sense with the ability
        to understand user psychology and deliver intuitive interfaces. Driven by a high sense of
        responsibility and effective communication skills, I'm eager to find opportunities to grow
        and elevate customer experiences for businesses.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "NPH Digital",
        timeframe: "Nov 2024 - Jan 2026",
        role: "Frontend Developer / Team Leader (Next.js / React.js / TypeScript) - Remote",
        achievements: [
          <>
            Developed a multi-platform Chatbot management system (Facebook, Website, Live Chat),
            building a standardized API Layer with Axios & TypeScript to improve code reusability
            and maintainability.
          </>,
          <>
            Deployed systems on VPS, configured Nginx, MySQL, CI/CD pipelines, and maintained
            multiple repositories across the organization.
          </>,
          <>
            Built the Admin OCCO social media management system, including a real-time customer
            support chat module using WebSocket for message state management, media file
            sending/receiving, and user data handling.
          </>,
          <>
            Created and maintained technical project documentation, including environment setup
            guides, directory structures, and repository maintenance docs to support intern
            onboarding.
          </>,
        ],
        images: [],
      },
      {
        company: "Hiday Technology JSC",
        timeframe: "Mar 2024 - Oct 2024",
        role: "Web Developer Intern (.NET Fullstack)",
        achievements: [
          <>
            Designed & implemented modular business APIs on ASP.NET Core 6 (MVC & API) architecture.
          </>,
          <>
            Managed the CMS system for Bac Lieu University website, handling content management
            and UI customization.
          </>,
          <>
            Built user interfaces using HTML5, CSS3, JavaScript, and KendoUI, optimizing UI/UX and
            improving responsive design for the website.
          </>,
          <>
            Collaborated directly with clients during deployment and handover phases in Bac Lieu,
            ensuring stable product performance in real-world environments.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "FPT Polytechnic College",
        description: (
          <>
            Software Development (Aug 2021 - Aug 2025). Achieved 3× Top 100 Outstanding Students
            and 2× Top 50 Outstanding Students.
          </>
        ),
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical Skills",
    skills: [
      {
        title: "Frontend Frameworks & Libraries",
        description: (
          <>Proficient in building modern, responsive, and performant web applications using React ecosystem and utility-first CSS.</>
        ),
        tags: [
          { name: "React.js" },
          { name: "Next.js", icon: "nextjs" },
          { name: "TypeScript", icon: "javascript" },
          { name: "TailwindCSS" },
          { name: "Redux" },
          { name: "Responsive Design" },
          { name: "Reusable Components" },
          { name: "Zod" },
        ],
        images: [],
      },
      {
        title: "Backend & API Integration",
        description: (
          <>Experienced in building and integrating RESTful APIs, real-time features, and authentication systems.</>
        ),
        tags: [
          { name: "ASP.NET Core" },
          { name: "RESTful API" },
          { name: "WebSocket" },
          { name: "JWT & RBAC" },
          { name: "SQL Server" },
          { name: "MySQL" },
          { name: "PostgreSQL" },
          { name: "NestJS" },
        ],
        images: [],
      },
      {
        title: "Tools & DevOps",
        description: (
          <>Familiar with modern development workflows, CI/CD pipelines, and deployment infrastructure.</>
        ),
        tags: [
          { name: "Git", icon: "github" },
          { name: "Turborepo" },
          { name: "Nginx" },
          { name: "VPS Deployment" },
          { name: "GitHub CI/CD" },
          { name: "Figma", icon: "figma" },
          { name: "Docker" },
        ],
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about frontend and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Frontend and fullstack projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/work/projects
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
