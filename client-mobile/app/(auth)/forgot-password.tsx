import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../src/api/auth.api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const requestReset = useMutation({ mutationFn: (e: string) => authApi.requestPasswordReset(e) });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Submit your email and TrailBlaze support or your law firm's admin will reset it for you directly.
      </Text>

      {submitted ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>Request submitted — someone will reach out to reset your password shortly.</Text>
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
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#0F4C3A" },
  title: { fontSize: 24, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#D1FAE5", textAlign: "center", marginBottom: 28, lineHeight: 20 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: "#065F46", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  successBox: { backgroundColor: "#DCFCE7", borderRadius: 10, padding: 16 },
  successText: { color: "#166534", fontSize: 14, lineHeight: 20 },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { color: "#fff", fontWeight: "700", textDecorationLine: "underline" },
});
