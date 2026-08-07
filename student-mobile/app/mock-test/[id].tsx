import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMockTestDetail, useStartAttempt, useSubmitAttempt } from "../../src/hooks";

type OptionKey = "A" | "B" | "C" | "D";

export default function MockTestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: test, isLoading } = useMockTestDetail(id);
  const startAttempt = useStartAttempt();
  const submitAttempt = useSubmitAttempt();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, OptionKey | null>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ score: number; totalQuestions: number; percentage: number } | null>(null);

  useEffect(() => {
    if (test && !attemptId && !startAttempt.isPending) {
      startAttempt.mutate(id, {
        onSuccess: (data) => {
          setAttemptId(data.attemptId);
          setSecondsLeft(data.durationMinutes * 60);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test]);

  const handleSubmit = useCallback(() => {
    if (!attemptId) return;
    const answerList = (test?.questions ?? []).map((q: any) => ({ questionId: q.questionId, selectedOption: answers[q.questionId] ?? null }));
    submitAttempt.mutate({ attemptId, answers: answerList }, { onSuccess: (data) => setResult(data) });
  }, [attemptId, answers, test]);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, result, handleSubmit]);

  if (isLoading || !test || !attemptId || secondsLeft === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 32 }}>{result.percentage >= 70 ? "🎉" : "📊"}</Text>
        <Text style={styles.resultTitle}>Test Complete</Text>
        <Text style={styles.resultScore}>{result.percentage}%</Text>
        <Text style={styles.resultText}>
          {result.score} / {result.totalQuestions} correct
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Back to Course</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const questions = test.questions ?? [];
  const q = questions[index];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLowTime = secondsLeft < 60;

  const options: { key: OptionKey; text: string }[] = q
    ? [
        { key: "A", text: q.question.optionA },
        { key: "B", text: q.question.optionB },
        { key: "C", text: q.question.optionC },
        { key: "D", text: q.question.optionD },
      ]
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View style={[styles.timerBar, isLowTime && { backgroundColor: "#FEF2F2" }]}>
        <Text style={styles.timerText}>
          {index + 1} / {questions.length}
        </Text>
        <Text style={[styles.timerText, isLowTime && { color: "#DC2626" }]}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {q && (
          <View style={styles.card}>
            <Text style={styles.questionText}>{q.question.question}</Text>
            {options.map((opt) => {
              const isSelected = answers[q.questionId] === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => setAnswers((prev) => ({ ...prev, [q.questionId]: opt.key }))}
                >
                  <View style={[styles.optionCircle, isSelected && { borderColor: "#2563EB" }]}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#2563EB" : "#6B7280" }}>{opt.key}</Text>
                  </View>
                  <Text style={styles.optionText}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity disabled={index === 0} onPress={() => setIndex((i) => i - 1)} style={{ opacity: index === 0 ? 0.4 : 1 }}>
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>
        {index + 1 < questions.length ? (
          <TouchableOpacity style={styles.primaryButtonSmall} onPress={() => setIndex((i) => i + 1)}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButtonSmall, { backgroundColor: "#F59E0B" }]}
            onPress={() =>
              Alert.alert("Submit Test?", "This can't be undone.", [
                { text: "Cancel", style: "cancel" },
                { text: "Submit", onPress: handleSubmit },
              ])
            }
          >
            <Text style={styles.primaryButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  timerBar: { flexDirection: "row", justifyContent: "space-between", padding: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  timerText: { fontWeight: "700", fontSize: 15 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  questionText: { fontSize: 16, fontWeight: "600", marginBottom: 14, lineHeight: 22 },
  option: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, marginBottom: 8 },
  optionSelected: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  optionCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: "#E5E7EB", justifyContent: "center", alignItems: "center", marginRight: 10 },
  optionText: { flex: 1, fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: "#fff" },
  navText: { color: "#2563EB", fontWeight: "700" },
  primaryButton: { backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 14, paddingHorizontal: 28, marginTop: 20 },
  primaryButtonSmall: { backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  resultTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  resultScore: { fontSize: 40, fontWeight: "800", color: "#2563EB", marginTop: 8 },
  resultText: { fontSize: 14, color: "#6B7280", marginTop: 4 },
});
