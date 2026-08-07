import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMcqList, useCheckAnswer } from "../../src/hooks";

type OptionKey = "A" | "B" | "C" | "D";

export default function PracticeScreen() {
  const { courseId, subjectId } = useLocalSearchParams<{ courseId: string; subjectId?: string }>();
  const { data: questions, isLoading } = useMcqList(courseId, subjectId);
  const checkAnswer = useCheckAnswer();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctOption: string; explanation: string | null } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const list = questions ?? [];
  const question = list[index];

  const handleSelect = (option: OptionKey) => {
    if (!question || feedback) return;
    setSelected(option);
    checkAnswer.mutate(
      { id: question.id, selectedOption: option },
      { onSuccess: (result) => { setFeedback(result); if (result.isCorrect) setCorrectCount((c) => c + 1); } }
    );
  };

  const handleNext = () => {
    setSelected(null);
    setFeedback(null);
    setIndex((i) => i + 1);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (list.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#6B7280" }}>No questions available here yet.</Text>
      </View>
    );
  }

  if (index >= list.length) {
    const percentage = Math.round((correctCount / list.length) * 100);
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 32 }}>{percentage >= 70 ? "🎉" : "💪"}</Text>
        <Text style={styles.resultTitle}>Session Complete</Text>
        <Text style={styles.resultText}>
          {correctCount} / {list.length} correct ({percentage}%)
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Back to Course</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const options: { key: OptionKey; text: string }[] = [
    { key: "A", text: question.optionA },
    { key: "B", text: question.optionB },
    { key: "C", text: question.optionC },
    { key: "D", text: question.optionD },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F8FAFC" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.progress}>
        {index + 1} / {list.length}
      </Text>
      <View style={styles.card}>
        <Text style={styles.questionText}>{question.question}</Text>
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          const isCorrectOpt = feedback && opt.key === feedback.correctOption;
          const isWrongSelected = feedback && isSelected && !feedback.isCorrect;
          let borderColor = "#E5E7EB";
          let bgColor = "#fff";
          if (isCorrectOpt) { borderColor = "#16A34A"; bgColor = "#F0FDF4"; }
          else if (isWrongSelected) { borderColor = "#DC2626"; bgColor = "#FEF2F2"; }
          else if (isSelected) { borderColor = "#2563EB"; bgColor = "#EFF6FF"; }

          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.option, { borderColor, backgroundColor: bgColor }]}
              onPress={() => handleSelect(opt.key)}
              disabled={!!feedback}
            >
              <View style={[styles.optionCircle, { borderColor }]}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: borderColor === "#E5E7EB" ? "#6B7280" : borderColor }}>{opt.key}</Text>
              </View>
              <Text style={styles.optionText}>{opt.text}</Text>
              {isCorrectOpt && <Ionicons name="checkmark-circle" size={20} color="#16A34A" />}
              {isWrongSelected && <Ionicons name="close-circle" size={20} color="#DC2626" />}
            </TouchableOpacity>
          );
        })}

        {feedback && (
          <View style={[styles.feedbackBox, { backgroundColor: feedback.isCorrect ? "#F0FDF4" : "#FEF2F2" }]}>
            <Text style={{ fontWeight: "700", color: feedback.isCorrect ? "#16A34A" : "#DC2626" }}>
              {feedback.isCorrect ? "Correct!" : "Not quite"}
            </Text>
            {feedback.explanation && <Text style={{ color: "#6B7280", marginTop: 4 }}>{feedback.explanation}</Text>}
          </View>
        )}

        {feedback && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>{index + 1 === list.length ? "Finish" : "Next Question"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  progress: { textAlign: "right", color: "#6B7280", marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#E5E7EB" },
  questionText: { fontSize: 17, fontWeight: "600", marginBottom: 16, lineHeight: 24 },
  option: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderRadius: 10, padding: 12, marginBottom: 10 },
  optionCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, justifyContent: "center", alignItems: "center", marginRight: 10 },
  optionText: { flex: 1, fontSize: 14 },
  feedbackBox: { borderRadius: 10, padding: 12, marginTop: 8 },
  primaryButton: { backgroundColor: "#2563EB", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 16 },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  resultTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  resultText: { fontSize: 15, color: "#6B7280", marginTop: 4, marginBottom: 20 },
});
