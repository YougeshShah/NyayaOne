import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { emailVerificationApi } from "../../src/api/auth.api";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");

  const requestCode = useMutation({
    mutationFn: () => emailVerificationApi.sendCode(email, "PASSWORD_RESET"),
    onSuccess: () => setStep("reset"),
  });

  const resetPassword = useMutation({
    mutationFn: () => emailVerificationApi.resetPassword(email, code, newPassword, institutionCode.trim() || undefined),
    onSuccess: () => router.replace("/(auth)/login"),
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={styles.title}>{step === "request" ? "Forgot Password?" : "Reset Password"}</Text>
      <Text style={styles.subtitle}>
        {step === "request" ? "Enter your email and we'll send you a code" : "Enter the code and your new password"}
      </Text>

      {step === "request" ? (
        <>
          {requestCode.isError && <Text style={styles.errorText}>Something went wrong. Please try again.</Text>}
          <TextInput style={styles.input} placeholder="Your Account Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TouchableOpacity
            style={[styles.button, (!email.trim() || requestCode.isPending) && { opacity: 0.5 }]}
            disabled={!email.trim() || requestCode.isPending}
            onPress={() => requestCode.mutate()}
          >
            {requestCode.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          {resetPassword.isError && <Text style={styles.errorText}>Invalid or expired code. Please try again.</Text>}
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
          />
          <TextInput style={styles.input} placeholder="New Password (min 8 characters)" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <TextInput
            style={styles.input}
            placeholder="Firm Code (only if you belong to more than one)"
            autoCapitalize="none"
            value={institutionCode}
            onChangeText={setInstitutionCode}
          />
          <TouchableOpacity
            style={[styles.button, (resetPassword.isPending || code.length !== 6 || newPassword.length < 8) && { opacity: 0.5 }]}
            disabled={resetPassword.isPending || code.length !== 6 || newPassword.length < 8}
            onPress={() => resetPassword.mutate()}
          >
            {resetPassword.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => requestCode.mutate()} disabled={requestCode.isPending} style={styles.link}>
            <Text style={styles.linkText}>Resend Code</Text>
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
  errorText: { color: "#FEE2E2", textAlign: "center", marginBottom: 12 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15 },
  codeInput: { textAlign: "center", letterSpacing: 8, fontSize: 22 },
  button: { backgroundColor: "#065F46", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { color: "#fff", fontWeight: "700", textDecorationLine: "underline" },
});
