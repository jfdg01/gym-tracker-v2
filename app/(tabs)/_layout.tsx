import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { PlayCircle, CalendarDays, Dumbbell, History, Settings } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            detachInactiveScreens={false}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1E1E1E', // Surface-Elevated
                    borderTopColor: '#333',
                    paddingTop: 5,
                    height: 60,
                    paddingBottom: 5,
                },
                tabBarActiveTintColor: '#4F46E5', // Primary-Energy
                tabBarInactiveTintColor: '#94A3B8', // Text-Muted
                tabBarLabelStyle: {
                    fontSize: 10,
                    marginBottom: 5,
                }
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Workout',
                    tabBarIcon: ({ color }) => <Icon as={PlayCircle} color={color} size="md" />,
                }}
            />
            <Tabs.Screen
                name="programs"
                options={{
                    title: 'Programs',
                    tabBarIcon: ({ color }) => <Icon as={CalendarDays} color={color} size="md" />,
                }}
            />
            <Tabs.Screen
                name="exercises"
                options={{
                    title: 'Exercises',
                    tabBarIcon: ({ color }) => <Icon as={Dumbbell} color={color} size="md" />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color }) => <Icon as={History} color={color} size="md" />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Icon as={Settings} color={color} size="md" />,
                }}
            />
        </Tabs>
    );
}
