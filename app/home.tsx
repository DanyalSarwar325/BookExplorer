import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BookShimmerGrid from "../components/ShimmerPlaceholder";
import { fetchMergedBooks, MergedBook } from "../services/bookService";
import { nytRankToStars } from "../utils/ratingUtils";

/** Render filled / half / empty star icons */
function renderStars(rating: number, size: number = 14) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Ionicons key={i} name="star" size={size} color="#F59E0B" />);
    } else if (rating >= i - 0.5) {
      stars.push(
        <Ionicons key={i} name="star-half" size={size} color="#F59E0B" />,
      );
    } else {
      stars.push(
        <Ionicons key={i} name="star-outline" size={size} color="#D1D5DB" />,
      );
    }
  }
  return stars;
}

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

  if (loading)
    return (
      <View style={styles.container}>
        {/* Navbar skeleton while loading */}
        <View style={styles.navbar}>
          <Text style={styles.menu}>☰</Text>
          <View style={styles.searchWrapper}>
            <TextInput
              placeholder="Search books..."
              placeholderTextColor="#999"
              style={styles.search}
              editable={false}
            />
            <Ionicons
              name="search"
              size={18}
              color="#B0B0B0"
              style={styles.searchIcon}
            />
          </View>
        </View>
        <BookShimmerGrid />
      </View>
    );

  return (
    <View style={styles.container}>
      {/* ⭐ NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.menu}>☰</Text>

        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search books..."
            placeholderTextColor="#999"
            style={styles.search}
            value={search}
            onChangeText={handleSearch}
          />
          <Ionicons
            name="search"
            size={18}
            color="#B0B0B0"
            style={styles.searchIcon}
          />
        </View>
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
            activeOpacity={0.85}
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

            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>

              {item.authors?.length > 0 && (
                <Text style={styles.author} numberOfLines={1}>
                  {item.authors.join(", ")}
                </Text>
              )}

              <View style={styles.starRow}>
                {renderStars(nytRankToStars(item.nytRank), 13)}
                <Text style={styles.starValue}>
                  {nytRankToStars(item.nytRank).toFixed(1)}
                </Text>
              </View>

              <View style={styles.badgeRow}>
                <Text style={styles.rankBadge}>#{item.nytRank} NYT</Text>
                {item.nytWeeksOnList > 0 && (
                  <Text style={styles.weeksBadge}>
                    {item.nytWeeksOnList}w on list
                  </Text>
                )}
              </View>
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

  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#000",
    borderRadius: 25,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },

  search: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },

  searchIcon: {
    marginLeft: 8,
  },

  /* ⭐ Cards — professional redesign */
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  img: {
    width: "100%",
    height: 180,
    backgroundColor: "#E5E7EB",
  },

  cardBody: {
    padding: 10,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 18,
  },

  author: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 5,
    flexWrap: "wrap",
  },

  rankBadge: {
    backgroundColor: "#FDE68A",
    color: "#92400E",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },

  weeksBadge: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },

  starRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 2,
  },

  starValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
    marginLeft: 4,
  },
});
