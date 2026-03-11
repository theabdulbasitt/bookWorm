import { create } from "zustand";
import { THEMES } from "../constants/colors";

const useThemeStore = create((set) => ({
    themeName: "forest",
    colors: THEMES.forest,
    setTheme: (name) => {
        if (THEMES[name]) {
            set({ themeName: name, colors: THEMES[name] });
        }
    },
}));

export default useThemeStore;
