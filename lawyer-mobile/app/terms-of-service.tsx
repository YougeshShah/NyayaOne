import { ScrollView, Text, StyleSheet } from "react-native";

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.h1}>Terms of Service — NyayaOne</Text>
      <Text style={styles.meta}>Last Updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</Text>

      <Text style={styles.h2}>1. Who We Are</Text>
      <Text style={styles.p}>NyayaOne is operated by Technocraftx Pvt. Ltd., based in Kathmandu, Nepal. Contact: support@technocraftx.com.</Text>

      <Text style={styles.h2}>2. Accounts</Text>
      <Text style={styles.p}>
        You must provide accurate information when registering. You are responsible for keeping your password confidential and for all
        activity under your account. We may suspend or terminate accounts that violate these terms.
      </Text>

      <Text style={styles.h2}>3. Who Can Use This Platform</Text>
      <Text style={styles.p}>
        Students preparing for Law, IELTS, IOE, medical entrance, Loksewa, and other exams. Law firms and educational institutions
        managing their own staff/students through the platform. You must be at least 13 years old to create an account.
      </Text>

      <Text style={styles.h2}>4. Subscriptions and Payment</Text>
      <Text style={styles.p}>
        Course access requires an active subscription unless marked "Free Demo." Payments are processed via eSewa, Khalti. Subscriptions
        are non-refundable once activated, except where required by law. Prices may change; we will notify active subscribers in
        advance.
      </Text>

      <Text style={styles.h2}>5. Acceptable Use</Text>
      <Text style={styles.p}>
        You agree not to share your account/subscription access with others, copy or redistribute course content or library materials,
        harass or abuse other users, or attempt to bypass security or access other users'/organizations' data.
      </Text>

      <Text style={styles.h2}>6. Content Ownership</Text>
      <Text style={styles.p}>
        Course materials, questions, and library content are owned by NyayaOne or the publishing institution, licensed to you for
        personal study use only. Content you submit remains reviewable by staff/institution graders for feedback purposes.
      </Text>

      <Text style={styles.h2}>7. AI Features</Text>
      <Text style={styles.p}>
        Some features use third-party AI services. Do not submit sensitive personal information, passwords, or payment details in chat
        messages.
      </Text>

      <Text style={styles.h2}>8. Live Classes</Text>
      <Text style={styles.p}>
        Live classes are hosted via Jitsi Meet. Recordings may be made available to enrolled students afterward. Do not record,
        redistribute, or share class content outside the platform without permission.
      </Text>

      <Text style={styles.h2}>9. Limitation of Liability</Text>
      <Text style={styles.p}>
        The platform is provided "as is." Legal Library content is for reference/study purposes only and is not legal advice — consult a
        licensed lawyer for actual legal matters. We are not liable for exam results, outcomes, or decisions made based on platform
        content.
      </Text>

      <Text style={styles.h2}>10. Termination</Text>
      <Text style={styles.p}>
        We may suspend or terminate your access if you violate these terms. You may stop using the platform and request account deletion
        at any time.
      </Text>

      <Text style={styles.h2}>11. Changes to These Terms</Text>
      <Text style={styles.p}>We may update these terms from time to time. Continued use after changes means you accept the updated terms.</Text>

      <Text style={styles.h2}>12. Governing Law</Text>
      <Text style={styles.p}>These terms are governed by the laws of Nepal.</Text>

      <Text style={styles.h2}>13. Contact</Text>
      <Text style={styles.p}>Questions about these terms: support@technocraftx.com</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  h1: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 4 },
  meta: { fontSize: 12, color: "#9CA3AF", marginBottom: 20 },
  h2: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 16, marginBottom: 6 },
  p: { fontSize: 14, color: "#4B5563", lineHeight: 21 },
});
