import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { emailVerificationApi } from "../../src/api";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const requestCode = useMutation({
    mutationFn: () => emailVerificationApi.sendCode(email, "PASSWORD_RESET"),
    onSuccess: () => setStep("reset"),
  });

  const resetPassword = useMutation({
    mutationFn: () => emailVerificationApi.resetPassword(email, code, newPassword),
    onSuccess: () => router.replace("/(auth)/login"),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === "request" ? "Forgot Password" : "Reset Password"}</Text>
      <Text style={styles.subtitle}>
        {step === "request" ? "Enter your email and we'll send you a code" : "Enter the code and your new password"}
      </Text>

      {step === "request" ? (
        <>
          {requestCode.isError && <Text style={styles.errorText}>Something went wrong. Please try again.</Text>}
          <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TouchableOpacity
            style={[styles.button, (requestCode.isPending || !email) && styles.buttonDisabled]}
            onPress={() => requestCode.mutate()}
            disabled={requestCode.isPending || !email}
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
          <TouchableOpacity
            style={[styles.button, (resetPassword.isPending || code.length !== 6 || newPassword.length < 8) && styles.buttonDisabled]}
            onPress={() => resetPassword.mutate()}
            disabled={resetPassword.isPending || code.length !== 6 || newPassword.length < 8}
          >
            {resetPassword.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => requestCode.mutate()} disabled={requestCode.isPending} style={styles.link}>
            <Text style={styles.linkText}>Resend Code</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={styles.link}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24 },
  errorText: { color: "#DC2626", textAlign: "center", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  codeInput: { textAlign: "center", letterSpacing: 8, fontSize: 22 },
  button: { backgroundColor: "#2563EB", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#2563EB", fontWeight: "600" },
});
