import { BdownError } from "./errors.ts";
import type { BiliPage } from "../providers/bilibili/metadata.ts";

export function selectPages(pages: BiliPage[], selector = "1", allPages = false) {
  if (!pages.length) return [];
  if (allPages || selector === "all") return pages;

  const selected = new Set<number>();
  for (const token of selector.split(",")) {
    const part = token.trim();
    if (!part) continue;

    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      for (let page = Math.min(start, end); page <= Math.max(start, end); page += 1) {
        selected.add(page);
      }
      continue;
    }

    const page = Number(part);
    if (Number.isInteger(page) && page > 0) {
      selected.add(page);
      continue;
    }

    throw new BdownError("INVALID_PAGE_SELECTOR", `Invalid page selector: ${selector}`, "Use --page 1, --page all, or --page 1,3-5.");
  }

  const result = pages.filter((page) => selected.has(page.page));
  if (!result.length) {
    throw new BdownError("PAGE_NOT_FOUND", `No matching pages for selector: ${selector}`, `This video has ${pages.length} page(s).`);
  }
  return result;
}
