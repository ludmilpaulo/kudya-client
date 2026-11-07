import { baseAPI } from "../services/types";
import type { ProductImage } from "../services/types";

/** Product images arrive as absolute URL strings (ProductSerializer) or `{ image }` objects (related products). */
export function productImageUrl(images?: Array<ProductImage | string> | null): string {
  const first = images?.[0];
  const raw = typeof first === "string" ? first : first?.image;
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  return `${baseAPI}${raw.startsWith("/") ? "" : "/"}${raw}`;
}
