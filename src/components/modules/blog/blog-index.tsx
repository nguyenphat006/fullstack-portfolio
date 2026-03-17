import { BlogSectionList } from "./components/blog-section-list";
export * from "./types";

export function BlogModulePage() {
	return (
		<main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
			<BlogSectionList />
		</main>
	);
}
