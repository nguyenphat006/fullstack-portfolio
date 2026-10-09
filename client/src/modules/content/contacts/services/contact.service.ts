import { createCrudService } from "@/lib/api/crud";
import type { ContactCreateInput, ContactFilters, ContactItem, ContactUpdateInput } from "../types";

/** CRUD + statistics + batch actions chuẩn cho `/contacts/` (BaseERPViewSet). Endpoint riêng: thêm bằng http.get/post. */
export const contactService = createCrudService<
  ContactItem,
  ContactCreateInput,
  ContactUpdateInput,
  ContactFilters
>("/contacts/");
