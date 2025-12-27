# Technical Insight: NativeWind v4 & Navigation Context Race Condition

## Overview
During the development of the "Start Workout" functionality, we encountered an intermittent error:
`ERROR Warning: Error: Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?`

This document outlines the root cause and the permanent mitigation strategy.

## Root Cause Analysis
The issue is a known race condition in **NativeWind v4** (specifically the `cssInterop` layer) when used with **Expo Router v4** (SDK 52).

### The Mechanism
1.  **CSS Interop Hydration**: NativeWind v4 uses a runtime `cssInterop` to map Tailwind utility classes to React Native style props.
2.  **Problematic Utilities**: Specific classes such as shadows (`shadow-*`), opacities (`opacity-*`), and color/alpha syntaxes (`bg-primary/10`) trigger synchronous runtime CSS parsing and state updates during the initial component render.
3.  **Context Blockage**: If these utilities are present in a component that is rendered immediately upon hydration (like the `HomeScreen` in a Tab layout), the runtime styling engine can occasionally "starve" the React Navigation context initialization.
4.  **Result**: The component renders before the `NavigationContainer` (internally managed by Expo Router) has fully broadcast the context, leading to the error.

## Mitigation & Prevention
To prevent this error, we must avoid triggering the NativeWind runtime CSS engine for "heavy" properties during the initial hydration of layout-critical screens.

### 1. Priority Refactoring
In screens like `index.tsx`, `ActiveWorkoutScreen.tsx`, and `ProgramDetailScreen.tsx`, we replaced problematic utility classes with stable **inline styles**.

**Avoid:**
```tsx
<Card className="shadow-soft-2 bg-primary/10" />
```

**Recommended:**
```tsx
<Card 
    className="bg-primary" // Simple colors are usually safe
    style={{ 
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        backgroundColor: 'rgba(79, 70, 229, 0.1)' 
    }} 
/>
```

### 2. Styling Guidelines
- **Shadows**: Always use inline `style` props or dedicated theme constants for shadows on the navigation's entry screens.
- **Opacities**: Use `rgba()` in inline styles instead of `/opacity` Tailwind shorthand for containers.
- **Layout-Critical Components**: Components that render immediately (Top-level Screens, Headers, Tab Bars) should favor inline styles for decorations to ensure navigation context is always available.

## Status: Resolved
The current implementation has been refactored across all major screens to ensure stability.
