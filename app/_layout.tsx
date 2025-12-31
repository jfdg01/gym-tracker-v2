import 'react-native-reanimated';
import '@/src/reanimatedConfig';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { View, Text, TouchableOpacity, Alert, DevSettings } from 'react-native';
import { expoDb } from '@/src/db/client';
import { deleteDatabaseSync } from 'expo-sqlite';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { db } from '@/src/db/client';
import { RestTimerProvider } from '@/src/components/RestTimerContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const router = useRouter();
    const navigationState = useRootNavigationState();
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const { success: dbSuccess, error: dbError } = useMigrations(db, migrations);

    // Initial check for a notification that might have opened the app
    useEffect(() => {
        Notifications.getLastNotificationResponseAsync().then(response => {
            const url = response?.notification.request.content.data?.url;
            if (url) {
                console.log('[Notification] App opened by notification with URL:', url);
                setPendingUrl(url);
            }
        });
    }, []);

    // Listener for notifications while the app is in any state
    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const url = response.notification.request.content.data?.url;
            console.log('[Notification] Response received while app is running, URL:', url);
            if (url) {
                setPendingUrl(url);
            }
        });

        return () => subscription.remove();
    }, []);

    // Perform navigation when router is ready and we have a pending URL
    useEffect(() => {
        const isReady = navigationState?.key && dbSuccess;
        if (pendingUrl && isReady) {
            console.log('[Notification] Router ready, navigating to:', pendingUrl);
            // Use setTimeout to ensure the navigation doesn't conflict with initial layout mount
            const timeout = setTimeout(() => {
                router.push(pendingUrl as any);
                setPendingUrl(null);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [pendingUrl, navigationState?.key, dbSuccess, router]);

    useEffect(() => {
        if (dbSuccess || dbError) {
            SplashScreen.hideAsync();
        }
    }, [dbSuccess, dbError]);

    const handleResetDatabase = async () => {
        Alert.alert(
            "Reset Database",
            "This will delete all your local data and restart the app. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Close (ignore if already closed) and delete the database
                            try {
                                expoDb.closeSync();
                            } catch (e) {
                                // Already closed or failed to close, proceed with deletion
                            }
                            deleteDatabaseSync('gym-tracker.db');
                            // Reload the app
                            DevSettings.reload();
                        } catch (e) {
                            console.error("Failed to reset database:", e);
                            Alert.alert("Error", "Failed to reset database.");
                        }
                    }
                }
            ]
        );
    };

    if (dbError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 }}>
                <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Migration Error</Text>
                <Text style={{ color: '#9ca3af', textAlign: 'center', marginBottom: 24 }}>{dbError.message}</Text>

                <TouchableOpacity
                    onPress={handleResetDatabase}
                    style={{
                        backgroundColor: '#ef4444',
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 100
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset Database</Text>
                </TouchableOpacity>

                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
                    Note: Resetting will clear all your exercises, programs, and history.
                </Text>
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
