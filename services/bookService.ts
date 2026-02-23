import {
    fetchGoogleBookByISBN,
    fetchGoogleBookByTitleAuthor,
    GoogleBook,
} from "./googleService";
import { fetchNYTBooks, NYTBook } from "./nytService";

/**
 * A merged book combines Google Books metadata (description, page count, etc.)
 * with NYT bestseller data (rank, weeks on list, etc.).
 *
 * The common key is **ISBN-13** — both APIs expose it:
 *   • Google Books → volumeInfo.industryIdentifiers[] (type "ISBN_13")
 *   • NYT → primary_isbn13
 *
 * Strategy:
 *   1. Fetch the NYT bestseller list (authoritative source of ranking data).
 *   2. For each NYT book, look up Google Books by ISBN-13.
 *   3. If the ISBN lookup misses, fall back to title+author search.
 *   4. Merge the two records into one unified MergedBook object.
 */

export interface MergedBook {
  // Google-sourced fields
  googleId: string | null;
  title: string;
  authors: string[];
  thumbnail: string | undefined;
  isbn13: string;
  description: string | undefined;
  publishedDate: string | undefined;
  pageCount: number | undefined;
  averageRating: number | undefined;
  ratingsCount: number | undefined;
  categories: string[] | undefined;

  // NYT-sourced fields
  nytRank: number;
  nytRankLastWeek: number;
  nytWeeksOnList: number;
  nytDescription: string;
  nytBookImage: string;
  nytBuyLinks: { name: string; url: string }[];
}

/**
 * Fetch NYT bestsellers and enrich each with Google Books data.
 * Returns fully merged books sorted by NYT rank.
 */
export async function fetchMergedBooks(): Promise<MergedBook[]> {
  const nytBooks = await fetchNYTBooks();

  if (nytBooks.length === 0) return [];

  // Look up each NYT book on Google Books (in parallel, batched to avoid
  // rate-limiting — 5 at a time).
  const merged: MergedBook[] = [];

  const batches = chunkArray(nytBooks, 5);

  for (const batch of batches) {
    const results = await Promise.all(
      batch.map((nyt) => enrichWithGoogle(nyt)),
    );
    merged.push(...results);
  }

  return merged.sort((a, b) => a.nytRank - b.nytRank);
}

/** Try ISBN lookup first, then title+author fallback, then return NYT-only data. */
async function enrichWithGoogle(nyt: NYTBook): Promise<MergedBook> {
  let google: GoogleBook | null = null;

  // 1️⃣  Primary match: ISBN-13
  if (nyt.primaryIsbn13) {
    google = await fetchGoogleBookByISBN(nyt.primaryIsbn13);
  }

  // 2️⃣  Fallback: title + author fuzzy search
  if (!google && nyt.title && nyt.author) {
    google = await fetchGoogleBookByTitleAuthor(nyt.title, nyt.author);
  }

  return {
    // Google fields (may be null if no match found)
    googleId: google?.id ?? null,
    title: google?.title ?? formatTitle(nyt.title),
    authors: google?.authors ?? [nyt.author],
    thumbnail: google?.thumbnail ?? nyt.bookImage,
    isbn13: nyt.primaryIsbn13,
    description: google?.description ?? nyt.description,
    publishedDate: google?.publishedDate,
    pageCount: google?.pageCount,
    averageRating: google?.averageRating,
    ratingsCount: google?.ratingsCount,
    categories: google?.categories,

    // NYT fields (always present)
    nytRank: nyt.rank,
    nytRankLastWeek: nyt.rankLastWeek,
    nytWeeksOnList: nyt.weeksOnList,
    nytDescription: nyt.description,
    nytBookImage: nyt.bookImage,
    nytBuyLinks: nyt.buyLinks,
  };
}

/** NYT titles are ALL-CAPS — convert to Title Case for display. */
function formatTitle(title: string): string {
  return title.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
