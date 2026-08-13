import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLogin } from "../../src/hooks/useAuth";
import { colors, spacing, radius } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const { t, language, setLanguage } = useTranslation();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password.");
      return;
    }
    loginMutation.mutate(
      { email, password },
      {
        onError: (err: any) => {
          Alert.alert("Login failed", err?.response?.data?.message || err?.message || "Please try again.");
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableOpacity style={styles.langToggle} onPress={() => setLanguage(language === "en" ? "ne" : "en")}>
        <Text style={styles.langToggleText}>{language === "en" ? "नेपाली" : "English"}</Text>
      </TouchableOpacity>

      <View style={styles.logoWrap}>
        <Text style={styles.brand}>NyayaOne</Text>
        <Text style={styles.subBrand}>{t("lawyerApp")}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t("email")}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@lawfirm.com"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>{t("password")}</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loginMutation.isPending}>
          <Text style={styles.buttonText}>{loginMutation.isPending ? t("signingIn") : t("signIn")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")} style={{ marginTop: 14, alignItems: "center" }}>
          <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    padding: spacing.lg,
  },
  logoWrap: { alignItems: "center", marginBottom: spacing.xl },
  langToggle: { position: "absolute", top: 50, right: spacing.lg, padding: spacing.sm },
  langToggleText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  brand: { fontSize: 32, fontWeight: "800", color: "#fff" },
  subBrand: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeButton: { padding: spacing.sm },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
