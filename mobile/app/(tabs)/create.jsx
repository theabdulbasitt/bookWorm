import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createStyles } from "../../assets/styles/create.styles";
import useThemeStore from "../../store/themeStore";
import useAuthStore from "../../store/authStore";
import { API_URL } from "../../constants/api";

export default function Create() {
    const { colors } = useThemeStore();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { token } = useAuthStore();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [caption, setCaption] = useState("");
    const [rating, setRating] = useState(3);
    const [image, setImage] = useState(null); // local URI
    const [imageBase64, setImageBase64] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission needed", "Please allow photo library access to pick a book image.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.6,
            base64: true,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageBase64(result.assets[0].base64);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !caption.trim() || !image) {
            Alert.alert("Missing fields", "Please fill in all fields and select an image.");
            return;
        }
        setIsLoading(true);
        try {
            const uriParts = image.split(".");
            const fileType = uriParts[uriParts.length - 1];
            const base64Image = `data:image/${fileType};base64,${imageBase64}`;

            const response = await fetch(`${API_URL}/books`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, caption, rating, image: base64Image }),
            });

            if (response.status === 401) {
                Alert.alert("Session Expired", "Please log in again.");
                useAuthStore.getState().logout();
                return;
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            Alert.alert("Success! 🎉", "Your book recommendation has been shared!", [
                {
                    text: "View Feed",
                    onPress: () => {
                        resetForm();
                        router.replace("/(tabs)/");
                    },
                },
            ]);
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to share book.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setCaption("");
        setRating(3);
        setImage(null);
        setImageBase64(null);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Book Recommendation</Text>
                        <Text style={styles.subtitle}>Share your favorite reads with others</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Title */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Book Title</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="book-outline"
                                    size={20}
                                    color={colors.primary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter book title"
                                    placeholderTextColor={colors.placeholderText}
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>
                        </View>

                        {/* Rating */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Your Rating</Text>
                            <View style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        style={styles.starButton}
                                    >
                                        <Ionicons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={32}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Image */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Book Image</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                                ) : (
                                    <View style={styles.placeholderContainer}>
                                        <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
                                        <Text style={styles.placeholderText}>Tap to select image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Caption */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Caption</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Write your review or thoughts about this book..."
                                placeholderTextColor={colors.placeholderText}
                                value={caption}
                                onChangeText={setCaption}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <Ionicons
                                        name="cloud-upload-outline"
                                        size={20}
                                        color={colors.white}
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.buttonText}>Share Recommendation</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
