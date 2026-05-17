import { prisma } from "../lib/prisma";
import { PROJECTS_DATA } from "./projects.seed";
import { BLOG_POSTS } from "./blogs.seed";

async function main() {
  console.log("Start seeding...");

  // Seed Projects
  for (const project of PROJECTS_DATA) {
    const existingProject = await prisma.project.findUnique({
      where: { slug: project.id },
    });
    
    if (!existingProject) {
      await prisma.project.create({
        data: {
          slug: project.id,
          title: project.title,
          summary: project.summary,
          stack: project.stack,
          year: project.year,
          image: project.image,
          color: project.color,
          role: project.role,
          content: project.content,
          liveUrl: project.liveUrl,
          githubUrl: project.githubUrl,
          featured: project.featured || false,
        },
      });
      console.log(`Created project: ${project.title}`);
    }
  }

  // Seed Blogs
  for (const blog of BLOG_POSTS) {
    const existingBlog = await prisma.blog.findUnique({
      where: { slug: blog.slug },
    });

    if (!existingBlog) {
      await prisma.blog.create({
        data: {
          slug: blog.slug,
          title: blog.title,
          excerpt: blog.excerpt,
          date: blog.date,
          category: blog.category,
          readTime: blog.readTime,
          image: blog.image,
          content: blog.content,
        },
      });
      console.log(`Created blog: ${blog.title}`);
    }
  }

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
