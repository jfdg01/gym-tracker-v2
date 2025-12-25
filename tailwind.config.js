/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}", // Added for Gluestack UI components
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: { energy: "#4F46E5" },
        surface: { deep: "#121212", elevated: "#1E1E1E" },
        success: { growth: "#10B981" },
        accent: { warning: "#F59E0B" },
        error: { critical: "#EF4444" },
      },
    },
  },
  plugins: [],
}
