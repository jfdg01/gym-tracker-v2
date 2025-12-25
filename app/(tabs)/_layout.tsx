import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'react-native';

import { Icon } from '@/components/ui/icon';
// We'll need icons. For now I'll use simple text labels or temporary placeholders if icons aren't set up.
// Actually, let's just use simple tab bar for now.

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1E1E1E', // Surface-Elevated
                    borderTopColor: '#333',
                },
                tabBarActiveTintColor: '#4F46E5', // Primary-Energy
                tabBarInactiveTintColor: '#94A3B8', // Text-Muted
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Workout',
                }}
            />
            <Tabs.Screen
                name="programs"
                options={{
                    title: 'Programs',
                }}
            />
            <Tabs.Screen
                name="exercises"
                options={{
                    title: 'Exercises',
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                }}
            />
        </Tabs>
    );
}
