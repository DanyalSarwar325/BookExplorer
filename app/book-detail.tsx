import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Render star icons for a rating (0–5) */
function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push("★");
    } else if (rating >= i - 0.5) {
      stars.push("★"); // half‑star rendered as full for simplicity
    } else {
      stars.push("☆");
    }
  }
  return <Text style={styles.stars}>{stars.join(" ")}</Text>;
}

export default function BookDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Data passed from the home screen (always available)
  const id = param(params.id);
  const isbn = param(params.isbn);
  const title = param(params.title);
  const authors = param(params.authors);
  const thumbnail = param(params.thumbnail);
  const passedDescription = param(params.description);
  const passedPublishedDate = param(params.publishedDate);
  const passedPageCount = param(params.pageCount);
  const passedRating = param(params.averageRating);
  const passedRatingsCount = param(params.ratingsCount);
  const nytRank = param(params.nytRank);
  const nytWeeks = param(params.nytWeeks);
  const nytDesc = param(params.nytDesc);

  // Extra detail fetched from Google (optional enrichment)
  const [extra, setExtra] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    if (id) enrichFromGoogle();
  }, [id]);

  async function enrichFromGoogle() {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${id}`,
      );
      const data = await res.json();
      if (data.volumeInfo) {
        setExtra(data.volumeInfo);
      }
    } catch (error) {
      console.error("Failed to fetch book detail:", error);
    } finally {
      setLoading(false);
    }
  }

  // Merge: prefer Google enrichment, fall back to route params
  const displayTitle = extra?.title ?? (title || "Unknown Title");
  const displayAuthors =
    extra?.authors?.join(", ") ?? (authors || "Unknown author");
  const displayThumbnail =
    extra?.imageLinks?.thumbnail?.replace("http://", "https://") ??
    (thumbnail || null);
  const displayDescription = extra?.description ?? (passedDescription || null);
  const displayPublishedDate =
    extra?.publishedDate ?? (passedPublishedDate || null);
  const displayRating =
    extra?.averageRating ?? (passedRating ? Number(passedRating) : null);
  const displayRatingsCount =
    extra?.ratingsCount ??
    (passedRatingsCount ? Number(passedRatingsCount) : null);

  // Extract year from date string like "2012-04-03" or "2012"
  const publishedYear = displayPublishedDate
    ? displayPublishedDate.split("-")[0]
    : null;

  // Show spinner only while enrichment is loading
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  // If we have absolutely nothing to show
  if (!title && !extra)
    return (
      <View style={styles.center}>
        <Text>Book not found</Text>
      </View>
    );

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Book Cover ── */}
        {displayThumbnail && (
          <View style={styles.coverWrapper}>
            <Image
              source={{ uri: displayThumbnail }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* ── Title & Author ── */}
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.authors}>{displayAuthors}</Text>

        {/* ── Published ── */}
        {publishedYear && (
          <Text style={styles.published}>Published in {publishedYear}</Text>
        )}

        {/* ── Rating Row ── */}
        {displayRating && (
          <View style={styles.ratingRow}>
            <StarRating rating={displayRating} />
            <Text style={styles.ratingText}>
              {displayRating.toFixed(1)}
              {displayRatingsCount ? ` (${displayRatingsCount} reviews)` : ""}
            </Text>
          </View>
        )}

        {/* ── NYT Bestseller badge ── */}
        {nytRank && (
          <View style={styles.nytBadge}>
            <Text style={styles.nytBadgeText}>
              📰 #{nytRank} NYT Bestseller
              {nytWeeks && Number(nytWeeks) > 0
                ? `  ·  ${nytWeeks} weeks on list`
                : ""}
            </Text>
          </View>
        )}

        {/* ── About the Author ── */}
        <Text style={styles.sectionTitle}>About the author</Text>
        <Text style={styles.sectionBody}>
          {buildAuthorBlurb(displayAuthors, displayTitle, publishedYear)}
        </Text>

        {/* ── Overview ── */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.sectionBody}>
          {stripHtml(displayDescription ?? nytDesc ?? "No overview available.")}
        </Text>
      </ScrollView>

      {/* ── Bottom Button ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.readBtn, isRead && styles.readBtnActive]}
          onPress={() => setIsRead(!isRead)}
          activeOpacity={0.8}
        >
          <Text style={styles.readBtnText}>
            {isRead ? "✓  Book Read" : "✓  Book Read"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Build a short author blurb from available data */
function buildAuthorBlurb(
  authors: string,
  title: string,
  year: string | null,
): string {
  const name = authors || "The author";
  const parts = [`${name} is known for the book ${title}.`];
  if (year) {
    parts.push(`Published in ${year}.`);
  }
  return parts.join(" ");
}

/** Strip basic HTML tags from Google Books descriptions */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/* ── Styles ── */
const ACCENT = "#4DD9B4"; // Mint / teal green from Figma

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: -2,
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 30,
  },

  /* Cover */
  coverWrapper: {
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 12,
  },
  coverImage: {
    width: 180,
    height: 270,
    borderRadius: 12,
  },

  /* Title / Author / Published */
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
  },
  authors: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginTop: 4,
  },
  published: {
    fontSize: 13,
    color: "#AAA",
    textAlign: "center",
    marginTop: 4,
  },

  /* Rating */
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  stars: {
    fontSize: 18,
    color: "#F5A623",
    letterSpacing: 2,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
  },

  /* NYT badge */
  nytBadge: {
    backgroundColor: "#FFF8E1",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  nytBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6D4C00",
  },

  /* Sections */
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    alignSelf: "flex-start",
    marginTop: 24,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#666",
    alignSelf: "flex-start",
  },

  /* Bottom button */
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 34,
    backgroundColor: "#FFFFFF",
  },
  readBtn: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  readBtnActive: {
    backgroundColor: "#3BBF9E",
  },
  readBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Misc */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
