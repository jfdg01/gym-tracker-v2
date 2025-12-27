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
import { RestTimerProvider } from '@/src/components/RestTimerContext';

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

    if (!dbSuccess) {
        return null;
    }

    return (
        <GluestackUIProvider mode="dark">
            <RestTimerProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Oops!' }} />
                </Stack>
                <StatusBar style="light" />
            </RestTimerProvider>
        </GluestackUIProvider>
    );
}
