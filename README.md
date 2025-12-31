# Gym Tracker v2

![React Native](https://img.shields.io/badge/React_Native-New_Arch-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-JSI-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![NativeWind](https://img.shields.io/badge/NativeWind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

A modern, **offline-first** mobile workout tracking application built with the "Golden Stack 2025". Designed for privacy-conscious lifters who want a fast, reliable, and powerful tracking experience without cloud dependencies.

---

## 📱 Overview

Gym Tracker v2 allows you to define custom programs, log complex workouts, and track your progress automatically. It runs entirely on your device, ensuring that your data is always available—even in the deepest basement gym with no signal.

## ✨ Key Features

### 🏋️‍♂️ Smart Workout Management
*   **Linear Progression**: Follow structured programs that guide you day-by-day.
*   **Auto-Resume**: Started a workout and got distracted? Pick up exactly where you left off.
*   **Smart Rest Timer**: Automatic countdowns with background notification support.

### 📈 Automatic Progression
*   **Weight & Difficulty**: The app automatically increases weight or difficulty levels when you hit your targets across all sets.
*   **Intelligent Validation**: Skipped sets prevent premature progression, ensuring you truly master the weight before moving up.

### 📚 Robust Exercise Library
*   **Flexible Tracking**: Support for Reps-based or Time-based exercises.
*   **Custom Resistance**: Track using Weight (kg/lbs) or Resistance Bands (Difficulty Levels).
*   **Archiving**: clean up your library without losing historical data.

### 🔒 Privacy by Design
*   **100% Offline**: No accounts, no servers, no tracking.
*   **Data Ownership**: Full JSON export/import capabilities. Your data belongs to you.

## 🛠 Tech Stack (Golden Stack 2025)

This project leverages the bleeding edge of the React Native ecosystem for maximum performance and developer experience.

*   **Framework**: [Expo SDK 52](https://expo.dev) (React Native 0.76+ with New Architecture)
*   **Language**: TypeScript
*   **Database**: SQLite via `expo-sqlite` (JSI synchronous access)
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team/) for type-safe queries and migrations
*   **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS compiled to native code)
*   **UI Components**: gluestack-ui v2 (Headless/Copy-paste architecture)
*   **State Management**: TanStack Query + React Context + Repository Pattern

## 🏗 Architecture

The application follows a clean **Repository Pattern** to decouple the UI from the data layer:

1.  **UI Layer**: React Native components using Custom Hooks.
2.  **Service Layer**: Business logic for progression, timer management, and validation.
3.  **Repository Layer**: Handles data transformation and persistence logic.
4.  **Data Layer**: Drizzle ORM performing synchronous JSI calls to SQLite.

## 🚀 Installation & Setup

### Prerequisites
*   Node.js 18+
*   Expo CLI (`npm install -g expo-cli`)
*   iOS Simulator (Mac only) or Android Emulator

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/gym-tracker-v2.git
    cd gym-tracker-v2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    # Run on Android
    npm run android

    # Run on iOS
    npm run ios
    ```

## 🗄 Database Schema

Core entities managed by SQLite:
*   `Programs` & `ProgramDays`: Structure of your workout routines.
*   `Exercises`: Definitions and global settings.
*   `WorkoutSessions`: Active state and history of completed workouts.
*   `WorkoutSets`: Granular logs of every rep and weight lifted.

## 🎨 Design System

We utilize a **Dark Mode First** design system optimized for gym environments:
*   **High Contrast**: Legible text even under harsh lighting.
*   **Touch Friendly**: Large 44x44px minimum touch targets.
*   **Color Coded**:
    *   `#4F46E5` (Indigo) for Primary Actions
    *   `#10B981` (Emerald) for Success/Completion
    *   `#EF4444` (Red) for Errors/Failure

## 🤝 Contributing

This is currently a private personal project. The codebase adheres to strict TS patterns and clean architecture principles outlined in `docs/coding-standards.md`.

## 📄 License

Private / Personal Use.
