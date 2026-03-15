import { BlogSectionList } from "./components/blog-section-list";

export default function BlogModulePage() {
	return (
		<main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
			<BlogSectionList />
		</main>
	);
}
