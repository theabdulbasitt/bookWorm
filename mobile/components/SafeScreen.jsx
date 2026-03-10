import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import COLORS from '../constants/colors';

export default function SafeScreen({ children }) {
    const insects = useSafeAreaInsets();
    return (
        <View style={[styles.container, { paddingTop: insects.top }]}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
})