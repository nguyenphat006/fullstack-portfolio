import dynamic from "next/dynamic";
export * from "./types";

import { PageBackground } from "@/components/shared/layout/page-background";

const BlogSectionList = dynamic(() => import("./components/blog-section-list").then((mod) => mod.BlogSectionList));

export function BlogModulePage() {
	return (
		<PageBackground>
			<BlogSectionList />
		</PageBackground>
	);
}
