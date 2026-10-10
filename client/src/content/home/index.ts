import type { Locale } from "../locales";
import { homeEn } from "./en";
import type { HomeContent } from "./types";
import { homeVi } from "./vi";

export type { HomeContent, HomeUi } from "./types";

export const HOME_CONTENT: Record<Locale, HomeContent> = { vi: homeVi, en: homeEn };
