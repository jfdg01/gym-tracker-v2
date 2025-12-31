# Gym Tracker App

![React Native](https://img.shields.io/badge/React_Native-New_Arch-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-JSI-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

I built this because I was tired of fitness apps requiring a subscription just to log a bench press.

Gym Tracker is totally offline, privacy-first, and designed for linear progression. It runs on the "Golden Stack 2025"—Expo 52 with the New Architecture enabled. It’s fast, synchronous, and doesn't phone home.

---

## 🛠 Under the Hood

The goal was to build a React Native app that feels truly native, without the bridge lag.

*   **Expo 52 (New Architecture)**: I enabled the New Arch to take advantage of the direct styling and layout engine. Animations are silky smooth.
*   **SQLite + JSI**: Using `expo-sqlite` with JSI means database calls are synchronous. You tap "Log Set", and it's saved instantly. No blinking spinners.
*   **Drizzle ORM**: Writing raw SQL is fun, but Drizzle gives me full type safety with my database schema. Refactoring is a breeze.
*   **NativeWind v4**: It compiles Tailwind CSS straight to native styles. The layout system is just... better.

## ✨ Why I Use It

### It does the math
I don't simply "track" exercises; I define **Programs**. The app knows what I did last week and automatically increases the weight or difficulty if I hit my targets. It forces me to progress.

### It shuts up and works
*   **Smart Timer**: Finish a set, and the rest timer starts. It runs in the background, so I can switch tracks on Spotify without losing my place.
*   **Offline First**: Gym basements have terrible reception. This app doesn't care.

### I own the data
Everything is stored in a local SQLite database. I built a JSON export feature so I can dump my entire history whenever I want. No data hostage situations.

## 🚀 Running Locally

If you want to build it yourself:

1.  **Clone it**
    ```bash
    git clone https://github.com/yourusername/gym-tracker-v2.git
    cd gym-tracker-v2
    ```

2.  **Install**
    ```bash
    npm install
    ```

3.  **Run (Android/iOS)**
    ```bash
    npm run android
    # or
    npm run ios
    ```

## 📄 License

Code is for private reference / personal use.
