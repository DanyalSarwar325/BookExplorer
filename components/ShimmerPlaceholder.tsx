import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

function ShimmerBox({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#D1D5DB",
          opacity,
        },
        style,
      ]}
    />
  );
}

/** A single shimmer card that mimics a book card */
function ShimmerCard() {
  return (
    <View style={styles.card}>
      {/* Image placeholder */}
      <ShimmerBox width="100%" height={180} borderRadius={12} />

      {/* Title line 1 */}
      <ShimmerBox
        width="85%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 12 }}
      />

      {/* Title line 2 */}
      <ShimmerBox
        width="60%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 6 }}
      />

      {/* Author */}
      <ShimmerBox
        width="50%"
        height={11}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />

      {/* Badge row */}
      <View style={styles.badgeRow}>
        <ShimmerBox width={60} height={20} borderRadius={10} />
        <ShimmerBox
          width={75}
          height={20}
          borderRadius={10}
          style={{ marginLeft: 6 }}
        />
      </View>
    </View>
  );
}

/** Full loading grid: 6 shimmer cards in a 2-column layout */
export default function BookShimmerGrid() {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ShimmerCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 10,
  },
});
