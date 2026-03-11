import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";

export default function Index() {
  const token = useAuthStore((state) => state.token);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const { colors } = useThemeStore();

  // Show spinner while AsyncStorage is being read
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (token) return <Redirect href="/(tabs)/" />;
  return <Redirect href="/(auth)/" />;
}