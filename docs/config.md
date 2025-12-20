# Project Configuration - NativeWind & Gluestack UI

This document outlines the steps to set up and configure **NativeWind** (Tailwind CSS) and **gluestack-ui** in the Gym Tracker v2 project.

## 1. Prerequisites
- Node.js > 18
- React Native >= 0.73 (or Expo >= 50)

## 2. Installation Steps

### 2.1 NativeWind & Tailwind CSS
Install NativeWind and its peer dependencies:

```bash
npm install nativewind@latest tailwindcss@latest
npx tailwindcss init
```

### 2.2 Gluestack UI
Initialize gluestack-ui in your project:

```bash
npx gluestack-ui init
```

Choose **NativeWind** as the styling engine when prompted.

## 3. Configuration Files

### 3.1 `tailwind.config.js`
Update the `content` array to include all your component files and add the NativeWind preset:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./docs/**/*.{md,mdx}", // Optional: if you want to use tailwind in docs
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Map our Design System tokens here
        primary: {
          energy: "#4F46E5", // Indigo
        },
        surface: {
          deep: "#121212",
          elevated: "#1E1E1E",
        },
        success: {
          growth: "#10B981",
        },
        accent: {
          warning: "#F59E0B",
        },
        error: {
          critical: "#EF4444",
        },
      },
    },
  },
  plugins: [],
}
```

### 3.2 `babel.config.js`
Configure the Babel plugin for NativeWind:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### 3.3 `metro.config.js` (for Tailwind CLI)
Ensure Metro is configured to handle the Tailwind CSS input if necessary (usually handled by NativeWind v4 automatically).

## 4. Usage

### 4.1 Styling with NativeWind
Use the `className` prop just like on the web:

```tsx
<View className="flex-1 bg-surface-deep p-4">
  <Text className="text-primary-energy font-bold text-2xl">
    Bench Press
  </Text>
</View>
```

### 4.2 Using Gluestack Components
Import components and wrap your app with the provider:

```tsx
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      {/* Your App Content */}
    </GluestackUIProvider>
  )
}
```

### 4.3 Adding New Components
Use the CLI to add only what you need:

```bash
npx gluestack-ui add button modal input
```
