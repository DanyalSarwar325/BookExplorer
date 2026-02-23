export interface GoogleBook {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | undefined;
  isbn13: string | undefined;
  description: string | undefined;
  publishedDate: string | undefined;
  pageCount: number | undefined;
  averageRating: number | undefined;
  ratingsCount: number | undefined;
  categories: string[] | undefined;
}

/** Search Google Books by a general query string */
export async function fetchGoogleBooks(
  query = "bestseller",
  maxResults = 30,
): Promise<GoogleBook[]> {
  try {
    const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${API_KEY}`,
    );

    const data = await res.json();

    if (!data.items) return [];

    return data.items.map(mapGoogleItem);
  } catch (error) {
    console.error("Google Books API error:", error);
    return [];
  }
}

/** Look up a single book on Google Books by ISBN-13 */
export async function fetchGoogleBookByISBN(
  isbn13: string,
): Promise<GoogleBook | null> {
  try {
    const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}&key=${API_KEY}`,
    );

    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    return mapGoogleItem(data.items[0]);
  } catch (error) {
    console.error(`Google Books ISBN lookup error (${isbn13}):`, error);
    return null;
  }
}

/** Look up a book on Google Books by title + author (fuzzy fallback) */
export async function fetchGoogleBookByTitleAuthor(
  title: string,
  author: string,
): Promise<GoogleBook | null> {
  try {
    const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
    const query = `intitle:${title}+inauthor:${author}`;

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&key=${API_KEY}`,
    );

    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    return mapGoogleItem(data.items[0]);
  } catch (error) {
    console.error(`Google Books title/author lookup error:`, error);
    return null;
  }
}

function mapGoogleItem(item: any): GoogleBook {
  const info = item.volumeInfo;
  return {
    id: item.id,
    title: info.title,
    authors: info.authors ?? [],
    thumbnail: info.imageLinks?.thumbnail,
    isbn13: info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")
      ?.identifier,
    description: info.description,
    publishedDate: info.publishedDate,
    pageCount: info.pageCount,
    averageRating: info.averageRating,
    ratingsCount: info.ratingsCount,
    categories: info.categories,
  };
}
