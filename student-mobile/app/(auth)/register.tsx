import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { useRegister, usePublicCourses } from "../../src/hooks";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [interestedCourseId, setInterestedCourseId] = useState<string | null>(null);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const register = useRegister();
  const { data: courses } = usePublicCourses();

  const handleSubmit = () => {
    register.mutate(
      { fullName, email, phone: phone || undefined, password, interestedCourseId: interestedCourseId ?? undefined },
      { onSuccess: () => router.replace("/(auth)/login") }
    );
  };

  const selectedCourseName = courses?.find((c) => c.id === interestedCourseId)?.name;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, justifyContent: "center", flexGrow: 1 }}>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Free to join — pick a course and start practicing</Text>

        {register.isError && <Text style={styles.error}>Registration failed. Try a different email.</Text>}
        {register.isSuccess && <Text style={styles.success}>Account created! Redirecting to login...</Text>}

        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Phone (optional)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder="Password (min 8 characters)" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={styles.input} onPress={() => setShowCoursePicker((v) => !v)}>
          <Text style={{ color: selectedCourseName ? "#111827" : "#9CA3AF", fontSize: 15 }}>
            {selectedCourseName ?? "What are you preparing for? (optional)"}
          </Text>
        </TouchableOpacity>
        {showCoursePicker && (
          <View style={styles.courseList}>
            {courses?.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.courseOption}
                onPress={() => {
                  setInterestedCourseId(c.id);
                  setShowCoursePicker(false);
                }}
              >
                <Text>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={register.isPending}>
          {register.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={styles.link}>
          <Text>
            Already have an account? <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2563EB" },
  title: { fontSize: 24, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#DBEAFE", textAlign: "center", marginBottom: 24 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15, justifyContent: "center" },
  courseList: { backgroundColor: "#fff", borderRadius: 10, marginTop: -6, marginBottom: 12, maxHeight: 200 },
  courseOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  button: { backgroundColor: "#1E40AF", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: "#FEE2E2", backgroundColor: "#DC2626", padding: 10, borderRadius: 8, marginBottom: 12, textAlign: "center" },
  success: { color: "#F0FDF4", backgroundColor: "#16A34A", padding: 10, borderRadius: 8, marginBottom: 12, textAlign: "center" },
  link: { marginTop: 20, alignItems: "center" },
  linkBold: { fontWeight: "700", color: "#fff", textDecorationLine: "underline" },
});
