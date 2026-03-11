import { View, Text, TouchableOpacity, Linking, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import useThemeStore from "../../store/themeStore";
import { THEMES } from "../../constants/colors";
import { createStyles } from "../../assets/styles/landing.styles";

const THEME_OPTIONS = [
  { name: "forest", emoji: "🌴" },
  { name: "retro", emoji: "☕" },
  { name: "ocean", emoji: "🌊" },
  { name: "blossom", emoji: "🌸" },
];

export default function Landing() {
  const { colors, themeName, setTheme } = useThemeStore();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>BookWorm 🐛</Text>
        <Text style={styles.description}>
          A vibrant community for book lovers. Connect, share your favorite reads, and discover new stories from around the world.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginTxt}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupBtn} onPress={() => router.push("/(auth)/signup")}>
          <Text style={styles.signupTxt}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hireMeText}>Hire me ✨</Text>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialBtn} onPress={() => openLink("https://www.linkedin.com/in/theabdulbasitt/")}>
          <Ionicons name="logo-linkedin" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => openLink("https://github.com/theabdulbasitt")}>
          <Ionicons name="logo-github" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => openLink("https://www.upwork.com/freelancers/~01a8206f6bac357148")}>
          <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 16 }}>Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.themeLabel}>Choose your vibe</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((t) => (
            <TouchableOpacity
              key={t.name}
              onPress={() => setTheme(t.name)}
              style={[
                styles.themeButton,
                { backgroundColor: THEMES[t.name].primary },
                themeName === t.name && styles.themeButtonActive,
              ]}
            >
              <Text style={styles.themeEmoji}>{t.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}