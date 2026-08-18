import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { emailVerificationApi } from "../../src/api";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [code, setCode] = useState("");

  const verify = useMutation({
    mutationFn: () => emailVerificationApi.verifyEmail(email, code),
    onSuccess: () => router.replace("/(auth)/login"),
  });

  const resend = useMutation({
    mutationFn: () => emailVerificationApi.sendCode(email, "REGISTRATION"),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to your email. Enter it below to activate your account.</Text>

      {verify.isError && <Text style={styles.errorText}>Invalid or expired code. Please try again.</Text>}
      {resend.isSuccess && <Text style={styles.successText}>A new code has been sent.</Text>}

      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
      />

      <TouchableOpacity
        style={[styles.button, (verify.isPending || code.length !== 6 || !email) && styles.buttonDisabled]}
        onPress={() => verify.mutate()}
        disabled={verify.isPending || code.length !== 6 || !email}
      >
        {verify.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Email</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => resend.mutate()} disabled={resend.isPending} style={styles.link}>
        <Text style={styles.linkText}>{resend.isPending ? "Sending..." : "Resend Code"}</Text>
      </TouchableOpacity>

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
  successText: { color: "#16A34A", textAlign: "center", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  codeInput: { textAlign: "center", letterSpacing: 8, fontSize: 22 },
  button: { backgroundColor: "#2563EB", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#2563EB", fontWeight: "600" },
});
