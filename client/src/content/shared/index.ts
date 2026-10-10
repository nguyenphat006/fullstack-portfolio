import type { Locale } from "../locales";
import { sharedEn } from "./en";
import { sharedVi, type SharedContent } from "./vi";

export type { SharedContent };
export const SHARED_CONTENT: Record<Locale, SharedContent> = { vi: sharedVi, en: sharedEn };
