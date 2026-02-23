import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchMergedBooks, MergedBook } from "../services/bookService";

export default function Home() {
  const [books, setBooks] = useState<MergedBook[]>([]);
  const [allBooks, setAllBooks] = useState<MergedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const merged = await fetchMergedBooks();
    setBooks(merged);
    setAllBooks(merged);
    setLoading(false);
  }

  /* ⭐ search filtering */
  function handleSearch(text: string) {
    setSearch(text);

    const filtered = allBooks.filter((b) =>
      b.title.toLowerCase().includes(text.toLowerCase()),
    );

    setBooks(filtered);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      {/* ⭐ NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.menu}>☰</Text>

        <TextInput
          placeholder="Search books..."
          style={styles.search}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* ⭐ BOOK GRID */}
      <FlatList
        data={books}
        keyExtractor={(i) => i.isbn13 ?? i.googleId ?? i.title}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/book-detail",
                params: {
                  id: item.googleId ?? "",
                  isbn: item.isbn13,
                  title: item.title,
                  authors: item.authors.join(", "),
                  thumbnail: item.thumbnail ?? item.nytBookImage ?? "",
                  description: item.description ?? "",
                  publishedDate: item.publishedDate ?? "",
                  pageCount: item.pageCount ? String(item.pageCount) : "",
                  averageRating: item.averageRating
                    ? String(item.averageRating)
                    : "",
                  ratingsCount: item.ratingsCount
                    ? String(item.ratingsCount)
                    : "",
                  nytRank: String(item.nytRank),
                  nytWeeks: String(item.nytWeeksOnList),
                  nytDesc: item.nytDescription,
                },
              })
            }
          >
            <Image
              source={{ uri: item.thumbnail ?? item.nytBookImage }}
              style={styles.img}
            />

            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.badgeRow}>
              <Text style={styles.rankBadge}>#{item.nytRank} NYT</Text>
              {item.nytWeeksOnList > 0 && (
                <Text style={styles.weeksBadge}>
                  {item.nytWeeksOnList}w on list
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 40,
    backgroundColor: "#F4F6FA",
  },

  /* ⭐ Navbar */
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  menu: {
    fontSize: 26,
    marginRight: 15,
  },

  search: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
  },

  /* ⭐ Cards */
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    elevation: 3,
  },

  img: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 6,
  },

  title: {
    fontSize: 13,
    fontWeight: "600",
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 4,
    flexWrap: "wrap",
  },

  rankBadge: {
    backgroundColor: "#FFD700",
    color: "#333",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },

  weeksBadge: {
    backgroundColor: "#E0E7FF",
    color: "#3B5998",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
});
