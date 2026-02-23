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
import { fetchGoogleBooks } from "../services/googleService";
import { fetchNYTBooks } from "../services/nytService";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const google = await fetchGoogleBooks();
    const nyt = await fetchNYTBooks();

    const nytIsbns = nyt.map((b: any) => b.primary_isbn13);
    const filtered = google.filter((b: any) => nytIsbns.includes(b.isbn13));

    const finalBooks = filtered.length ? filtered : google;

    setBooks(finalBooks);
    setAllBooks(finalBooks);
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
        keyExtractor={(i) => i.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/book-detail",
                params: { id: item.id },
              })
            }
          >
            <Image source={{ uri: item.thumbnail }} style={styles.img} />

            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
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
});
