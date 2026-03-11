import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    ActivityIndicator,
    TextInput
} from "react-native";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { createStyles } from "../../assets/styles/profile.styles";
import useThemeStore from "../../store/themeStore";
import useAuthStore from "../../store/authStore";
import { API_URL } from "../../constants/api";

export default function Profile() {
    const { colors } = useThemeStore();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { user, token, logout, updateUser } = useAuthStore();
    const router = useRouter();

    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fullUser, setFullUser] = useState(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState(user?.username || "");
    const [editEmail, setEditEmail] = useState(user?.email || "");
    const [editImage, setEditImage] = useState(null); // base64 payload
    const [previewImage, setPreviewImage] = useState(
        user?.profileImage?.replace("svg", "png") || `https://api.dicebear.com/7.x/initials/png?seed=${user?.username || "U"}`
    );
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Books and Full User Profile Data (for followers count)
    const fetchProfileData = useCallback(async () => {
        try {
            // Fetch User Books
            const resBooks = await fetch(`${API_URL}/books/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (resBooks.status === 401) {
                if (useAuthStore.getState().token) {
                    Alert.alert("Session Expired", "Please log in again.");
                    logout();
                }
                return;
            }

            const dataBooks = await resBooks.json();
            if (!resBooks.ok) throw new Error(dataBooks.message);
            setBooks(dataBooks);

            // Fetch Full User Profile using our new endpoint
            const resUser = await fetch(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const dataUser = await resUser.json();
            if (resUser.ok) {
                setFullUser(dataUser);
            }

        } catch (error) {
            Alert.alert("Error", "Failed to load profile data.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleDelete = (bookId) => {
        Alert.alert("Delete Book", "Are you sure you want to delete this recommendation?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const res = await fetch(`${API_URL}/books/${bookId}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        
                        if (res.status === 401) {
                            Alert.alert("Session Expired", "Please log in again.");
                            logout();
                            return;
                        }

                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message);
                        setBooks((prev) => prev.filter((b) => b._id !== bookId));
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete book.");
                    }
                },
            },
        ]);
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/(auth)/");
                },
            },
        ]);
    };

    // Pick a new profile image
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setPreviewImage(result.assets[0].uri);
            setEditImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    // Save Profile Changes
    const handleSaveProfile = async () => {
        if (!editUsername.trim() || !editEmail.trim()) {
            Alert.alert("Error", "Username and email cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                username: editUsername.trim(),
                email: editEmail.trim(),
            };
            if (editImage) {
                payload.profileImage = editImage;
            }

            const res = await fetch(`${API_URL}/users/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // Successfully updated
            await updateUser({
                ...user,
                username: data.username,
                email: data.email,
                profileImage: data.profileImage
            });

            setFullUser(data); // update local follower/following UI
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully!");

        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const renderStars = (rating) =>
        [1, 2, 3, 4, 5].map((star) => (
            <Ionicons
                key={star}
                name={star <= rating ? "star" : "star-outline"}
                size={12}
                color={colors.primary}
            />
        ));

    const renderBook = ({ item }) => (
        <View style={styles.bookItem}>
            <Image source={{ uri: item.image }} style={styles.bookImage} resizeMode="cover" />
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
                <Text style={styles.bookCaption} numberOfLines={2}>{item.caption}</Text>
                <Text style={styles.bookDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item._id)}
            >
                <Ionicons name="trash-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Profile / Edit Card */}
            {isEditing ? (
                <View style={styles.editCard}>
                    <View style={styles.editHeader}>
                        <Text style={styles.editTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={(() => setIsEditing(false))}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.editImageContainer} onPress={pickImage}>
                        <Image source={{ uri: previewImage }} style={styles.editProfileImage} />
                        <View style={styles.editImageOverlay}>
                            <Ionicons name="camera" size={14} color={colors.white} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={editUsername}
                            onChangeText={setEditUsername}
                            placeholderTextColor={colors.placeholderText}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={editEmail}
                            onChangeText={setEditEmail}
                            placeholderTextColor={colors.placeholderText}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={handleSaveProfile}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: previewImage }}
                        style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.username}>{user?.username}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                        <Text style={styles.memberSince}>
                            {fullUser?.followers?.length || 0} Followers • {fullUser?.following?.length || 0} Following
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Ionicons name="pencil-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={colors.white} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Books list */}
            <View style={styles.booksHeader}>
                <Text style={styles.booksTitle}>Your Recommendations</Text>
                <Text style={styles.booksCount}>{books.length} books</Text>
            </View>

            <FlatList
                data={books}
                keyExtractor={(item) => item._id}
                renderItem={renderBook}
                contentContainerStyle={styles.booksList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={50} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No recommendations yet.{"\n"}Share your first book!</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => router.push("/(tabs)/create")}
                        >
                            <Text style={styles.addButtonText}>Add a Book</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

        </View>
    );
}
