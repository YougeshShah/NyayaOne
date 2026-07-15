import { View, ActivityIndicator } from "react-native";
import { colors } from "../src/theme/theme";

// This screen is shown only for an instant while AuthGate (in _layout.tsx)
// determines where to redirect (login vs dashboard) after SecureStore rehydrates.
export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.primaryDark }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}
