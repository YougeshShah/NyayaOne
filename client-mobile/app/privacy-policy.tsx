import { ScrollView, Text, StyleSheet } from "react-native";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.h1}>Privacy Policy — NyayaOne</Text>
      <Text style={styles.meta}>Last Updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</Text>

      <Text style={styles.h2}>1. Who We Are</Text>
      <Text style={styles.p}>
        NyayaOne is operated by Technocraftx Pvt. Ltd. This policy explains what personal data we collect, why, and how we protect it.
        Contact: support@technocraftx.com.
      </Text>

      <Text style={styles.h2}>2. What We Collect</Text>
      <Text style={styles.h3}>Account Information</Text>
      <Text style={styles.p}>Full name, email address, phone number (optional), password (stored encrypted, never in plain text).</Text>
      <Text style={styles.h3}>Usage Data</Text>
      <Text style={styles.p}>
        Course progress, mock test scores, MCQ answers, study time, bookmarks. Chat messages sent to the AI study assistant. Essay/writing
        submissions (for grading purposes).
      </Text>
      <Text style={styles.h3}>Payment Data</Text>
      <Text style={styles.p}>
        Payment amount, course purchased, transaction status. We do NOT store your card/eSewa/Khalti login credentials — payments are
        processed directly by eSewa/Khalti, and we only receive confirmation that payment succeeded.
      </Text>
      <Text style={styles.h3}>Technical Data</Text>
      <Text style={styles.p}>IP address, browser/device type, login timestamps (for security and troubleshooting).</Text>

      <Text style={styles.h2}>3. How We Use Your Data</Text>
      <Text style={styles.p}>
        To provide and improve the platform, communicate with you, personalize your experience, and detect/prevent fraud, abuse, or
        security issues.
      </Text>

      <Text style={styles.h2}>4. Third-Party Services We Use</Text>
      <Text style={styles.p}>
        Payment processing: eSewa, Khalti. AI features (study assistant chatbot, content generation) powered by Anthropic's Claude API —
        do not share sensitive personal information in chat. Video classes: Jitsi Meet. We do not sell your personal data to advertisers
        or third parties.
      </Text>

      <Text style={styles.h2}>5. Institution/Organization Data Sharing</Text>
      <Text style={styles.p}>
        If you are added to the platform by an institution, that institution's staff can see your name, contact info, enrollment status,
        and your progress/scores within courses they manage. They cannot see your payment details, password, or activity in unrelated
        courses.
      </Text>

      <Text style={styles.h2}>6. Data Retention</Text>
      <Text style={styles.p}>
        We retain your account data as long as your account is active. If you delete your account, we remove your personal data within
        90 days, except where legally required to keep records.
      </Text>

      <Text style={styles.h2}>7. Your Rights</Text>
      <Text style={styles.p}>
        You can request a copy of your data, correct inaccurate information (via your Profile page), or request account/data deletion by
        contacting support@technocraftx.com.
      </Text>

      <Text style={styles.h2}>8. Data Security</Text>
      <Text style={styles.p}>
        Passwords are hashed. We use industry-standard practices to protect your data. No system is 100% secure — if a breach occurs, we
        will notify affected users as required by law.
      </Text>

      <Text style={styles.h2}>9. Children's Privacy</Text>
      <Text style={styles.p}>
        This platform is intended for users 13+ years old. We do not knowingly collect data from children below this age without
        appropriate consent.
      </Text>

      <Text style={styles.h2}>10. Changes to This Policy</Text>
      <Text style={styles.p}>We may update this policy from time to time. Significant changes will be communicated via email or an in-app notice.</Text>

      <Text style={styles.h2}>11. Contact Us</Text>
      <Text style={styles.p}>Questions about this policy or your data: support@technocraftx.com</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  h1: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 4 },
  meta: { fontSize: 12, color: "#9CA3AF", marginBottom: 20 },
  h2: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 16, marginBottom: 6 },
  h3: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 8, marginBottom: 4 },
  p: { fontSize: 14, color: "#4B5563", lineHeight: 21 },
});
