import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Linking, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMcqList, useCheckAnswer, useBookmarks, useToggleBookmark } from "../../src/hooks";
import { resolveMediaUrl } from "../../src/api/client";

type OptionKey = "A" | "B" | "C" | "D";

// Some practice questions embed a reading passage ahead of the actual
// question — split those out so the passage renders in its own reference
// panel instead of running together with the question as one wall of text.
// Mirrors splitPassage() in the web app's McqPracticePage.tsx.
function splitPassage(text: string): { passage: string | null; question: string } {
  const match = text.match(/^Reading Passage:\s*"([\s\S]*?)"\s*\n\n([\s\S]*)$/);
  if (match) return { passage: match[1], question: match[2] };
  return { passage: null, question: text };
}

export default function PracticeScreen() {
  const { courseId, subjectId } = useLocalSearchParams<{ courseId: string; subjectId?: string }>();
  const { data: questions, isLoading } = useMcqList(courseId, subjectId);
  const checkAnswer = useCheckAnswer();
  const { data: bookmarks } = useBookmarks();
  const toggleBookmark = useToggleBookmark();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [multiBlankAnswers, setMultiBlankAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctOption?: string;
    correctAnswerText?: string;
    blankResults?: boolean[];
    explanation: string | null;
  } | null>(null);
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

  const handleSubmitText = () => {
    if (!question || feedback || !textAnswer.trim()) return;
    checkAnswer.mutate(
      { id: question.id, selectedOption: textAnswer.trim() },
      { onSuccess: (result) => { setFeedback(result); if (result.isCorrect) setCorrectCount((c) => c + 1); } }
    );
  };

  const handleSubmitMultiBlank = () => {
    if (!question || feedback || multiBlankAnswers.some((a) => !a?.trim())) return;
    checkAnswer.mutate(
      { id: question.id, selectedOption: multiBlankAnswers.map((a) => a.trim()).join("|") },
      { onSuccess: (result) => { setFeedback(result); if (result.isCorrect) setCorrectCount((c) => c + 1); } }
    );
  };

  const handleNext = () => {
    setSelected(null);
    setTextAnswer("");
    setMultiBlankAnswers([]);
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

  const { passage, question: questionText } = splitPassage(question.question);

  const isFreeTextAnswer = question.answerType === "FILL_BLANK" || question.answerType === "SHORT_ANSWER";
  const isMultiBlank = question.answerType === "MULTI_BLANK";
  const multiBlankSegments = isMultiBlank ? questionText.split(/(\{\{\d+\}\})/g) : [];
  const blankCount = multiBlankSegments.filter((s) => /^\{\{\d+\}\}$/.test(s)).length;
  const options: { key: OptionKey; text: string }[] = (
    [
      { key: "A" as OptionKey, text: question.optionA },
      { key: "B" as OptionKey, text: question.optionB },
      { key: "C" as OptionKey, text: question.optionC },
      { key: "D" as OptionKey, text: question.optionD },
    ] as { key: OptionKey; text: string | null | undefined }[]
  ).filter((o): o is { key: OptionKey; text: string } => !!o.text);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F8FAFC" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.progress}>
        {index + 1} / {list.length}
      </Text>

      {question.audioUrl && (
        <TouchableOpacity style={styles.audioBar} onPress={() => { const url = resolveMediaUrl(question.audioUrl); if (url) Linking.openURL(url); }}>
          <Ionicons name="volume-high-outline" size={20} color="#2563EB" />
          <Text style={styles.audioBarText}>Play Audio</Text>
          <Ionicons name="open-outline" size={16} color="#6B7280" />
        </TouchableOpacity>
      )}

      {passage && (
        <View style={styles.passageBox}>
          <Text style={styles.passageLabel}>READING PASSAGE</Text>
          <Text style={styles.passageText}>{passage}</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Text style={[styles.questionText, { flex: 1 }]}>
            {isMultiBlank
              ? multiBlankSegments.map((segment, i) => {
                  const blankMatch = segment.match(/^\{\{(\d+)\}\}$/);
                  if (!blankMatch) return segment;
                  const blankIndex = parseInt(blankMatch[1], 10) - 1;
                  return `[__${blankIndex + 1}__]`;
                }).join("")
              : questionText}
          </Text>
          <TouchableOpacity
            onPress={() => toggleBookmark.mutate({ resourceType: "MCQ", resourceId: question.id })}
            style={{ marginLeft: 8 }}
          >
            <Ionicons
              name={bookmarks?.some((b) => b.resourceId === question.id) ? "bookmark" : "bookmark-outline"}
              size={22}
              color="#2563EB"
            />
          </TouchableOpacity>
        </View>
        {isMultiBlank ? (
          <View style={{ marginBottom: 12 }}>
            {Array.from({ length: blankCount }).map((_, i) => {
              const blankState = feedback?.blankResults?.[i];
              return (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 2 }}>Blank {i + 1}</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      blankState === true ? { borderColor: "#16A34A" } : blankState === false ? { borderColor: "#DC2626" } : null,
                    ]}
                    placeholder="Your answer..."
                    value={multiBlankAnswers[i] ?? ""}
                    editable={!feedback}
                    onChangeText={(t) => {
                      const next = [...multiBlankAnswers];
                      while (next.length < blankCount) next.push("");
                      next[i] = t;
                      setMultiBlankAnswers(next);
                    }}
                  />
                </View>
              );
            })}
            {!feedback && (
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 6, opacity: multiBlankAnswers.length >= blankCount && multiBlankAnswers.every((a) => a?.trim()) ? 1 : 0.5 }]}
                onPress={handleSubmitMultiBlank}
                disabled={multiBlankAnswers.length < blankCount || multiBlankAnswers.some((a) => !a?.trim())}
              >
                <Text style={styles.primaryButtonText}>Submit Answers</Text>
              </TouchableOpacity>
            )}
            {feedback && !feedback.isCorrect && feedback.correctAnswerText && (
              <Text style={{ color: "#16A34A", fontWeight: "700", marginTop: 8 }}>
                Correct answers: {feedback.correctAnswerText.split("|").join(", ")}
              </Text>
            )}
          </View>
        ) : isFreeTextAnswer ? (
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[styles.textInput, feedback ? { borderColor: feedback.isCorrect ? "#16A34A" : "#DC2626" } : null]}
              placeholder="Type your answer..."
              value={textAnswer}
              onChangeText={setTextAnswer}
              editable={!feedback}
            />
            {!feedback && (
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 10, opacity: textAnswer.trim() ? 1 : 0.5 }]}
                onPress={handleSubmitText}
                disabled={!textAnswer.trim()}
              >
                <Text style={styles.primaryButtonText}>Submit Answer</Text>
              </TouchableOpacity>
            )}
            {feedback && !feedback.isCorrect && feedback.correctAnswerText && (
              <Text style={{ color: "#16A34A", fontWeight: "700", marginTop: 8 }}>
                Correct answer: {feedback.correctAnswerText}
              </Text>
            )}
          </View>
        ) : (
          options.map((opt) => {
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
          })
        )}

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
  audioBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  audioBarText: { flex: 1, color: "#2563EB", fontWeight: "700", fontSize: 14 },
  passageBox: {
    backgroundColor: "#FAFBFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  passageLabel: { fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 8, letterSpacing: 0.5 },
  passageText: { fontSize: 14, lineHeight: 22, color: "#1F2937" },
  option: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderRadius: 10, padding: 12, marginBottom: 10 },
  optionCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, justifyContent: "center", alignItems: "center", marginRight: 10 },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  optionText: { flex: 1, fontSize: 14 },
  feedbackBox: { borderRadius: 10, padding: 12, marginTop: 8 },
  primaryButton: { backgroundColor: "#2563EB", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 16 },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  resultTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  resultText: { fontSize: 15, color: "#6B7280", marginTop: 4, marginBottom: 20 },
});
