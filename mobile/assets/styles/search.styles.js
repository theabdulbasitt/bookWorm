import { StyleSheet } from "react-native";

export const createStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    // ─── Header & Search Bar ────────────────────────────────────────────────
    header: {
      padding: 16,
      backgroundColor: COLORS.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 12,
      height: 44,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: COLORS.textDark,
      fontSize: 15,
    },
    clearIcon: {
      padding: 4,
    },
    // ─── Lists & Headings ──────────────────────────────────────────────────────
    listContainer: {
      padding: 16,
      paddingBottom: 40,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.textPrimary,
      marginBottom: 16,
      marginTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 40,
    },
    // ─── User Card ────────────────────────────────────────────────────────────
    userCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.cardBackground,
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    username: {
      fontSize: 15,
      fontWeight: "600",
      color: COLORS.textPrimary,
    },
    followersCount: {
      fontSize: 12,
      color: COLORS.textSecondary,
      marginTop: 2,
    },
    // ─── Follow Button ────────────────────────────────────────────────────────
    followButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 16,
      minWidth: 90,
      alignItems: "center",
      justifyContent: "center",
    },
    followingButton: {
      backgroundColor: "transparent",
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 16,
      minWidth: 90,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    followButtonText: {
      color: COLORS.white,
      fontSize: 13,
      fontWeight: "600",
    },
    followingButtonText: {
      color: COLORS.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    // ─── Empty States ─────────────────────────────────────────────────────────
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.textPrimary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: 14,
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });
