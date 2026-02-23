import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { nytRankToStars } from "../utils/ratingUtils";

function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Render star icons using Ionicons */
function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
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
  return <View style={{ flexDirection: "row", gap: 2 }}>{stars}</View>;
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

  // NYT-derived star rating (always available for bestsellers)
  const nytStarRating = nytRank ? nytRankToStars(Number(nytRank)) : null;

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
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Book Details
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero section with cover ── */}
        <View style={styles.heroSection}>
          {displayThumbnail && (
            <View style={styles.coverWrapper}>
              <Image
                source={{ uri: displayThumbnail }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            </View>
          )}

          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.authors}>by {displayAuthors}</Text>

          {/* ── Star Rating ── */}
          {nytStarRating != null && (
            <View style={styles.ratingContainer}>
              <StarRating rating={nytStarRating} size={22} />
              <Text style={styles.ratingValue}>{nytStarRating.toFixed(1)}</Text>
              <Text style={styles.ratingLabel}>NYT Rating</Text>
            </View>
          )}
        </View>

        {/* ── Quick Info Row ── */}
        <View style={styles.infoRow}>
          {publishedYear && (
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Year</Text>
              <Text style={styles.infoValue}>{publishedYear}</Text>
            </View>
          )}
          {extra?.pageCount || passedPageCount ? (
            <View style={styles.infoItem}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#6B7280"
              />
              <Text style={styles.infoLabel}>Pages</Text>
              <Text style={styles.infoValue}>
                {extra?.pageCount ?? passedPageCount}
              </Text>
            </View>
          ) : null}
          {nytRank && (
            <View style={styles.infoItem}>
              <Ionicons name="trophy-outline" size={18} color="#F59E0B" />
              <Text style={styles.infoLabel}>NYT Rank</Text>
              <Text style={styles.infoValue}>#{nytRank}</Text>
            </View>
          )}
          {nytWeeks && Number(nytWeeks) > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Weeks</Text>
              <Text style={styles.infoValue}>{nytWeeks}</Text>
            </View>
          )}
        </View>

        {/* ── NYT Bestseller badge ── */}
        {nytRank && (
          <View style={styles.nytBadge}>
            <Ionicons name="newspaper-outline" size={16} color="#92400E" />
            <Text style={styles.nytBadgeText}>
              #{nytRank} NYT Bestseller
              {nytWeeks && Number(nytWeeks) > 0
                ? `  ·  ${nytWeeks} weeks on list`
                : ""}
            </Text>
          </View>
        )}

        {/* ── Google Rating (if available) ── */}
        {displayRating != null && (
          <View style={styles.googleRatingRow}>
            <Ionicons name="logo-google" size={14} color="#4285F4" />
            <StarRating rating={displayRating} size={14} />
            <Text style={styles.googleRatingText}>
              {displayRating.toFixed(1)}
              {displayRatingsCount
                ? ` (${displayRatingsCount.toLocaleString()} reviews)`
                : ""}
            </Text>
          </View>
        )}

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── About the Author ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={18} color="#1F2937" />
            <Text style={styles.sectionTitle}>About the Author</Text>
          </View>
          <Text style={styles.sectionBody}>
            {buildAuthorBlurb(displayAuthors, displayTitle, publishedYear)}
          </Text>
        </View>

        {/* ── Overview ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={18} color="#1F2937" />
            <Text style={styles.sectionTitle}>Overview</Text>
          </View>
          <Text style={styles.sectionBody}>
            {stripHtml(
              displayDescription ?? nytDesc ?? "No overview available.",
            )}
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom Button ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.readBtn, isRead && styles.readBtnActive]}
          onPress={() => setIsRead(!isRead)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRead ? "checkmark-circle" : "checkmark-circle-outline"}
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.readBtnText}>
            {isRead ? "Marked as Read" : "Mark as Read"}
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
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#FAFBFC",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  /* Hero section */
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  /* Cover */
  coverWrapper: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderRadius: 14,
  },
  coverImage: {
    width: 160,
    height: 240,
    borderRadius: 14,
  },

  /* Title / Author */
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    lineHeight: 28,
  },
  authors: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },

  /* Rating */
  ratingContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 2,
  },

  /* Quick info row */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoItem: {
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },

  /* NYT badge */
  nytBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  nytBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
  },

  /* Google rating */
  googleRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 12,
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  googleRatingText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 24,
    marginTop: 20,
  },

  /* Sections */
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4B5563",
  },

  /* Bottom button */
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    backgroundColor: "#FAFBFC",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  readBtn: {
    backgroundColor: "#10B981",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  readBtnActive: {
    backgroundColor: "#059669",
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
    backgroundColor: "#FAFBFC",
  },
});
