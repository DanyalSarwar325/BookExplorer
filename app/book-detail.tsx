import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function BookDetail() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${id}`,
      );
      const data = await res.json();
      if (data.volumeInfo) {
        setBook(data.volumeInfo);
      }
    } catch (error) {
      console.error("Failed to fetch book detail:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (!book)
    return (
      <View style={styles.center}>
        <Text>Book not found</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {book.imageLinks?.thumbnail && (
        <Image
          source={{
            uri: book.imageLinks.thumbnail.replace("http://", "https://"),
          }}
          style={styles.img}
        />
      )}
      <Text style={styles.title}>{book.title}</Text>
      {book.subtitle && <Text style={styles.subtitle}>{book.subtitle}</Text>}
      <Text style={styles.authors}>
        {book.authors?.join(", ") ?? "Unknown author"}
      </Text>
      {book.publishedDate && (
        <Text style={styles.meta}>Published: {book.publishedDate}</Text>
      )}
      {book.pageCount && (
        <Text style={styles.meta}>{book.pageCount} pages</Text>
      )}
      {book.averageRating && (
        <Text style={styles.meta}>
          ⭐ {book.averageRating} / 5 ({book.ratingsCount} ratings)
        </Text>
      )}
      {book.description && (
        <Text style={styles.description}>{book.description}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F6FA" },
  img: { width: "100%", height: 280, borderRadius: 12, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: "bold" },
  subtitle: { fontSize: 16, color: "#555", marginTop: 4 },
  authors: { fontSize: 15, color: "#333", marginTop: 8 },
  meta: { fontSize: 14, color: "#666", marginTop: 4 },
  description: { fontSize: 14, lineHeight: 22, marginTop: 15, color: "#444" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
