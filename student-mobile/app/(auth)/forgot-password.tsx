import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { useRequestPasswordReset } from "../../src/hooks";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const requestReset = useRequestPasswordReset();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        We don't have automatic email reset set up yet — submit your email and your institution or our support
        team will reset it for you directly.
      </Text>

      {submitted ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            Request submitted. Your institution admin or our support team will reach out to reset your password
            shortly.
          </Text>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Your Account Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity
            style={[styles.button, !email.trim() && { opacity: 0.5 }]}
            disabled={!email.trim() || requestReset.isPending}
            onPress={() => requestReset.mutate(email.trim(), { onSuccess: () => setSubmitted(true) })}
          >
            {requestReset.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Request</Text>}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.back()} style={styles.link}>
        <Text style={styles.linkText}>Back to Sign In</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#2563EB" },
  title: { fontSize: 24, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#DBEAFE", textAlign: "center", marginBottom: 28, lineHeight: 20 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: "#1E40AF", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  successBox: { backgroundColor: "#DCFCE7", borderRadius: 10, padding: 16 },
  successText: { color: "#166534", fontSize: 14, lineHeight: 20 },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { color: "#fff", fontWeight: "700", textDecorationLine: "underline" },
});
