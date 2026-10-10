import type { Locale } from "../locales";
import { projectEn } from "./en";
import { projectVi, type ProjectContent } from "./vi";

export type { ProjectContent, ProjectUi } from "./vi";
export const PROJECT_CONTENT: Record<Locale, ProjectContent> = { vi: projectVi, en: projectEn };
