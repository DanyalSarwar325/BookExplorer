export async function fetchGoogleBooks() {
  try {
    const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=40&key=${API_KEY}`,
    );

    const data = await res.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      isbn13: item.volumeInfo.industryIdentifiers?.find(
        (i: any) => i.type === "ISBN_13",
      )?.identifier,
    }));
  } catch (error) {
    console.error("Google Books API error:", error);
    return [];
  }
}
