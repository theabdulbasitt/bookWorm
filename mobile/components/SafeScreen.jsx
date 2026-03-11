import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useThemeStore from "../store/themeStore";

export default function SafeScreen({ children }) {
    const insets = useSafeAreaInsets();
    const { colors } = useThemeStore();

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});