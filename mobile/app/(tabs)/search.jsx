import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "../../assets/styles/search.styles";
import useThemeStore from "../../store/themeStore";
import useAuthStore from "../../store/authStore";
import { API_URL } from "../../constants/api";

export default function Search() {
  const { colors } = useThemeStore();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, token, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Load suggestions initially
  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/users/suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuggestions(data);
    } catch (error) {
      // Silently fail suggestions
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Handle Search Input -> Debounced
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/users/search?q=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          logout();
          return;
        }
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token, logout]);

  // Toggle Follow Status
  const toggleFollow = async (targetUserId) => {
    try {
      const res = await fetch(`${API_URL}/users/follow/${targetUserId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        Alert.alert("Session Expired", "Please log in again.");
        logout();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Optimistically update the UI arrays to display it toggled (add/remove from followers)
      const updateList = (list) =>
        list.map((u) => {
          if (u._id === targetUserId) {
            // Is it already returning true (followed) or false (unfollowed)?
            const wasFollowing = u.followers?.includes(user?.id);
            const newFollowers = wasFollowing
              ? u.followers.filter((id) => id !== user?.id)
              : [...(u.followers || []), user?.id];
            return { ...u, followers: newFollowers };
          }
          return u;
        });

      setUsers(updateList(users));
      setSuggestions(updateList(suggestions));
    } catch (error) {
      Alert.alert("Error", "Could not complete this action.");
    }
  };

  const renderUserCard = ({ item }) => {
    const isFollowing = item.followers?.includes(user?.id);

    return (
      <View style={styles.userCard}>
        <Image
          source={{
            uri:
              item.profileImage?.replace("svg", "png") ||
              `https://api.dicebear.com/7.x/initials/png?seed=${item.username || "U"}`,
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.followersCount}>
            {item.followers?.length || 0} {(item.followers?.length || 0) === 1 ? "follower" : "followers"}
          </Text>
        </View>
        <TouchableOpacity
          style={isFollowing ? styles.followingButton : styles.followButton}
          onPress={() => toggleFollow(item._id)}
        >
          <Text style={isFollowing ? styles.followingButtonText : styles.followButtonText}>
            {isFollowing ? "Following" : "Add ✨"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    if (searchQuery.trim().length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={50} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>We couldn't find anyone with "{searchQuery}"</Text>
        </View>
      );
    }
    return null;
  };

  const isSearchActive = searchQuery.trim().length > 0;
  const listData = isSearchActive ? users : suggestions;
  const listTitle = isSearchActive ? "Search Results" : "Suggested Users";

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={colors.placeholderText}
              editable={false}
            />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={18} color={colors.placeholderText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item._id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.sectionTitle}>{listTitle}</Text>}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}
