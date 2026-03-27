import { BLOG_POSTS } from "@/config/blogs";
import { notFound } from "next/navigation";
import { BlogDetailContent } from "@/components/modules/blog/components/details/blog-detail-content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  
  if (!post) {
    return { title: 'Bài viết không tồn tại' };
  }
  
  return {
    title: `${post.title} | Blog ERICSS`,
    description: post.excerpt,
  };
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) notFound();

  return <BlogDetailContent post={post} />;
}
