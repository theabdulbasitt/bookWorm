import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "../../assets/styles/home.styles";
import { THEMES } from "../../constants/colors";
import useThemeStore from "../../store/themeStore";
import useAuthStore from "../../store/authStore";
import { API_URL } from "../../constants/api";

const THEME_OPTIONS = [
    { name: "forest", emoji: "🌴" },
    { name: "retro", emoji: "☕" },
    { name: "ocean", emoji: "🌊" },
    { name: "blossom", emoji: "🌸" },
];

export default function Home() {
    const { colors, themeName, setTheme } = useThemeStore();
    const { token } = useAuthStore();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const pageRef = useRef(1);
    const loadingRef = useRef(false);

    const fetchBooks = useCallback(
        async (refresh = false) => {
            if (loadingRef.current) return;
            if (!refresh && !hasMore) return;

            loadingRef.current = true;
            const page = refresh ? 1 : pageRef.current;

            refresh ? setRefreshing(true) : setLoading(true);

            try {
                const res = await fetch(`${API_URL}/books?page=${page}&limit=5`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (res.status === 401) {
                    Alert.alert("Session Expired", "Please log in again.");
                    useAuthStore.getState().logout();
                    return;
                }

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                setBooks((prev) => (refresh ? data.books : [...prev, ...data.books]));
                pageRef.current = page + 1;
                setHasMore(page < data.totalPages);
            } catch (error) {
                Alert.alert("Error", "Failed to load books. Is the backend running?");
            } finally {
                loadingRef.current = false;
                setLoading(false);
                setRefreshing(false);
            }
        },
        [token, hasMore]
    );

    useEffect(() => {
        fetchBooks(true);
    }, []);

    const renderStars = (rating) =>
        [1, 2, 3, 4, 5].map((star) => (
            <Ionicons
                key={star}
                name={star <= rating ? "star" : "star-outline"}
                size={14}
                color={colors.primary}
            />
        ));

    const renderBook = ({ item }) => (
        <View style={styles.bookCard}>
            <View style={styles.bookHeader}>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: item.user?.profileImage?.replace("svg", "png") || `https://api.dicebear.com/7.x/initials/png?seed=${item.user?.username || "U"}` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.username}>{item.user?.username}</Text>
                </View>
            </View>
            <View style={styles.bookImageContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.bookImage}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.bookDetails}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
                <Text style={styles.caption}>{item.caption}</Text>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm 🐛</Text>
            <Text style={styles.headerSubtitle}>
                Discover great reads from the community ⚡
            </Text>
            {/* Theme picker */}
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
    );

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <ActivityIndicator
                style={styles.footerLoader}
                color={colors.primary}
                size="small"
            />
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No books yet</Text>
            <Text style={styles.emptySubtext}>
                Be the first to share a book recommendation!
            </Text>
        </View>
    );

    if (loading && books.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={books}
                keyExtractor={(item) => item._id}
                renderItem={renderBook}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={() => fetchBooks(false)}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={() => fetchBooks(true)}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
