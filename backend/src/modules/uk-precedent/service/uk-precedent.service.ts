import { AppError } from "../../../common/errors/AppError";

// Live search against UK National Archives' Find Case Law API -- results
// are returned directly to the user, never stored in our own database.
// Storing/bulk-extracting these records requires a separate "computational
// analysis" permission from the National Archives that we do not have yet;
// live pass-through search does not require that permission.
export const ukPrecedentService = {
  async search(query: string, page: number = 1) {
    const url = `https://caselaw.nationalarchives.gov.uk/atom.xml?query=${encodeURIComponent(query)}&page=${page}&per_page=20`;
    const response = await fetch(url);
    if (!response.ok) {
      throw AppError.badRequest(`UK case law search failed: ${response.status}`);
    }
    const xml = await response.text();

    // Minimal XML parsing -- extract just the fields we need from each
    // <entry> without pulling in a full XML parser dependency.
    const entries: any[] = [];
    const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
    for (const match of entryMatches) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1] ?? "";
      const author = entry.match(/<author>\s*<name>([\s\S]*?)<\/name>/)?.[1] ?? "";
      const link = entry.match(/<link href="([^"]*)" rel="alternate"\/>/)?.[1] ?? "";
      const ncn = entry.match(/type="ukncn">([\s\S]*?)<\/tna:identifier>/)?.[1] ?? "";
      entries.push({ title, publishedDate: published, court: author, url: link, citation: ncn });
    }

    return { items: entries, page, source: "UK National Archives - Find Case Law" };
  },
};
