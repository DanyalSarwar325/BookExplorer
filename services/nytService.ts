export async function fetchNYTBooks() {
  try {
    const KEY = process.env.EXPO_PUBLIC_NYT_KEY;

    const res = await fetch(
      `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${KEY}`,
    );

    const data = await res.json();

    return data.results?.books ?? [];
  } catch (error) {
    console.error("NYT Books API error:", error);
    return [];
  }
}
