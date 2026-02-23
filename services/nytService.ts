export interface NYTBook {
  title: string;
  author: string;
  primaryIsbn13: string;
  primaryIsbn10: string;
  rank: number;
  rankLastWeek: number;
  weeksOnList: number;
  publisher: string;
  description: string;
  bookImage: string;
  buyLinks: { name: string; url: string }[];
}

export async function fetchNYTBooks(): Promise<NYTBook[]> {
  try {
    const KEY = process.env.EXPO_PUBLIC_NYT_KEY;

    const res = await fetch(
      `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${KEY}`,
    );

    const data = await res.json();
    const books = data.results?.books ?? [];

    return books.map((b: any) => ({
      title: b.title,
      author: b.author,
      primaryIsbn13: b.primary_isbn13,
      primaryIsbn10: b.primary_isbn10,
      rank: b.rank,
      rankLastWeek: b.rank_last_week,
      weeksOnList: b.weeks_on_list,
      publisher: b.publisher,
      description: b.description,
      bookImage: b.book_image,
      buyLinks: b.buy_links ?? [],
    }));
  } catch (error) {
    console.error("NYT Books API error:", error);
    return [];
  }
}
