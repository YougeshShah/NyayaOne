import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { useRegister } from "../../src/hooks";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();

  const handleSubmit = () => {
    register.mutate(
      { fullName, email, phone: phone || undefined, password },
      { onSuccess: () => router.replace("/(auth)/login") }
    );
  };

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
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: "#1E40AF", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: "#FEE2E2", backgroundColor: "#DC2626", padding: 10, borderRadius: 8, marginBottom: 12, textAlign: "center" },
  success: { color: "#F0FDF4", backgroundColor: "#16A34A", padding: 10, borderRadius: 8, marginBottom: 12, textAlign: "center" },
  link: { marginTop: 20, alignItems: "center" },
  linkBold: { fontWeight: "700", color: "#fff", textDecorationLine: "underline" },
});
