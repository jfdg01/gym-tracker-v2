import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { db, expoDb } from '@/src/db/client';
import { deleteDatabaseAsync } from 'expo-sqlite';

// ... inside RootLayout component
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { success: dbSuccess, error: dbError } = useMigrations(db, migrations);

    // TEMPORARY: Use this to wipe the database if you have migration issues
    useEffect(() => {
        async function clearDb() {
            try {
                // WARNING: This deletes the database file!
                console.log("Attempting to delete database...");
                await expoDb.closeAsync();
                await deleteDatabaseAsync('gym-tracker.db');
                console.log("Database deleted - please reload app again");
            } catch (e) {
                console.error("Failed to delete database:", e);
            }
        }
        // UNCOMMENT the line below to wipe it once, then comment it back out
        // clearDb();
    }, []);

    useEffect(() => {
        if (dbSuccess || dbError) {
            SplashScreen.hideAsync();
        }
    }, [dbSuccess, dbError]);

    if (dbError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                <Text style={{ color: 'red' }}>Migration Error: {dbError.message}</Text>
            </View>
        )
    }

    // Optional: Show loading state if DB is initializing? 
    // For now, if loaded is true but DB not success/error yet, we might want to wait.
    // maximizing safety, let's wait for DB.
    if (!dbSuccess) {
        return null;
    }

    return (
        <GluestackUIProvider mode="dark">
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" />
        </GluestackUIProvider>
    );
}
