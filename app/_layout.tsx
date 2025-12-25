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
import { db } from '@/src/db/client';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { success: dbSuccess, error: dbError } = useMigrations(db, migrations);

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
