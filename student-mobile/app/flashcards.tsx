import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFlashcards, useSubmitFamiliarity } from "../src/hooks";

export default function FlashcardsScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { data: cards, isLoading } = useFlashcards(courseId);
  const submitFamiliarity = useSubmitFamiliarity();

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Flashcards</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No flashcards available for this course yet.</Text>
        </View>
      </View>
    );
  }

  const card = cards[index % cards.length];

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  };

  const handleRate = (familiarity: "AGAIN" | "GOOD" | "EASY") => {
    submitFamiliarity.mutate({ id: card.id, familiarity });
    goNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Flashcards</Text>
        <Text style={styles.counter}>
          {index + 1} / {cards.length}
        </Text>
      </View>

      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setFlipped((f) => !f)}
          style={[styles.card, flipped && styles.cardFlipped]}
        >
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{card.difficulty}</Text>
          </View>
          {!flipped ? (
            <>
              <Text style={styles.term}>{card.term}</Text>
              <Text style={styles.hint}>Tap to reveal</Text>
            </>
          ) : (
            <>
              <Text style={styles.definition}>{card.definition}</Text>
              {card.example && <Text style={styles.example}>{card.example}</Text>}
            </>
          )}
        </TouchableOpacity>

        {flipped ? (
          <View style={styles.rateRow}>
            <TouchableOpacity style={[styles.rateButton, styles.rateAgain]} onPress={() => handleRate("AGAIN")}>
              <Text style={styles.rateButtonText}>Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rateButton, styles.rateGood]} onPress={() => handleRate("GOOD")}>
              <Text style={styles.rateButtonText}>Good</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rateButton, styles.rateEasy]} onPress={() => handleRate("EASY")}>
              <Text style={styles.rateButtonText}>Easy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={goNext} style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={{ color: "#6B7280", fontWeight: "600" }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  title: { fontSize: 18, fontWeight: "700" },
  counter: { fontSize: 13, color: "#6B7280" },
  emptyText: { color: "#6B7280", fontSize: 15, textAlign: "center", paddingHorizontal: 32 },
  card: {
    minHeight: 280,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  cardFlipped: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  difficultyBadge: { position: "absolute", top: 16, alignSelf: "center", backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  difficultyText: { fontSize: 11, fontWeight: "700", color: "#6B7280" },
  term: { fontSize: 28, fontWeight: "800", textAlign: "center", marginTop: 20 },
  hint: { fontSize: 12, color: "#9CA3AF", marginTop: 24 },
  definition: { fontSize: 18, fontWeight: "600", textAlign: "center", marginTop: 20 },
  example: { fontSize: 14, color: "#6B7280", fontStyle: "italic", textAlign: "center", marginTop: 12 },
  rateRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  rateButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1.5 },
  rateAgain: { borderColor: "#DC2626", backgroundColor: "#FEF2F2" },
  rateGood: { borderColor: "#D97706", backgroundColor: "#FFFBEB" },
  rateEasy: { borderColor: "#16A34A", backgroundColor: "#F0FDF4" },
  rateButtonText: { fontWeight: "700", fontSize: 14, color: "#111827" },
});
