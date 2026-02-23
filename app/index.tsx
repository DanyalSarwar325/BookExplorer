import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Illustration */}
      <Image
        source={require("../assets/images/book.jpg")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Start your journey</Text>

      {/* Description */}
      <Text style={styles.description}>
        Access the 30+ millions books in various languages with an easy and
        simple monthly subscription and read anywhere, any devices. First month
        will be free.
      </Text>

      {/* Primary Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/home")}
      >
        <Text style={styles.primaryButtonText}>Explore Now</Text>
      </TouchableOpacity>

      {/* Secondary Button */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  image: {
    width: 280,
    height: 220,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#3A86FF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#3A86FF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#3A86FF",
    fontWeight: "600",
  },
});
