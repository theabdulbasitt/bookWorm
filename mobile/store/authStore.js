import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,

    // ─── Register ────────────────────────────────────────────────────────────────
    register: async (username, email, password) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Registration failed");

            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            set({ user: data.user, token: data.token });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            set({ isLoading: false });
        }
    },

    // ─── Login ───────────────────────────────────────────────────────────────────
    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login failed");

            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            set({ user: data.user, token: data.token });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            set({ isLoading: false });
        }
    },

    // ─── Logout ──────────────────────────────────────────────────────────────────
    logout: async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        set({ user: null, token: null });
    },

    // ─── Update User Locally ─────────────────────────────────────────────────────
    updateUser: async (newUser) => {
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        set({ user: newUser });
    },

    // ─── Check persisted auth on app start ───────────────────────────────────────
    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userStr = await AsyncStorage.getItem("user");
            if (token && userStr) {
                set({ token, user: JSON.parse(userStr) });
            }
        } catch (error) {
            console.log("Error checking auth:", error);
        } finally {
            set({ isCheckingAuth: false });
        }
    },
}));

export default useAuthStore;
