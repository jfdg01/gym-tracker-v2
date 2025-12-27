import React, { useState, useCallback } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { CalendarIcon, ChevronRightIcon, TrendingUpIcon } from 'lucide-react-native';
import { WorkoutService } from '@/src/services/WorkoutService';
import { WorkoutSession } from '@/src/types/domain';
import { AppHeader } from '@/src/components/ui-library/AppHeader';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { StatusBadge } from '@/src/components/ui-library/StatusBadge';

export const HistoryScreen = () => {
    const router = useRouter();
    const [history, setHistory] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(false);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await WorkoutService.getHistory();
            setHistory(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [loadHistory])
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Box className="flex-1 bg-surface-deep">
            <AppHeader title="History" showBack={false} />

            <VStack space="md" className="flex-1 px-4 mt-4">

                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadHistory} tintColor="#fff" />
                    }
                >
                    <VStack space="sm" className="pb-24">
                        {history.length === 0 ? (
                            <Box className="py-20 items-center justify-center">
                                <Icon as={TrendingUpIcon} size="xl" className="text-typography-700 mb-4" />
                                <Text className="text-typography-500 text-center">No workouts completed yet. Your progress will appear here!</Text>
                            </Box>
                        ) : (
                            history.map((session) => (
                                <Pressable
                                    key={session.id}
                                    onPress={() => router.push(`/history/${session.id}`)}
                                >
                                    <AppCard className="p-4 mb-3">
                                        <HStack className="justify-between items-center">
                                            <VStack space="xs" className="flex-1">
                                                <HStack space="md" className="items-center">
                                                    <HStack space="xs" className="items-center">
                                                        <Icon as={CalendarIcon} size="xs" className="text-primary-energy" />
                                                        <Text className="text-typography-500 text-xs font-semibold">
                                                            {session.completedAt ? formatDate(session.completedAt) : 'In Progress'}
                                                        </Text>
                                                    </HStack>

                                                    <StatusBadge
                                                        label={session.status === 'COMPLETED' ? 'Success' : session.status === 'ABANDONED' ? 'Abandoned' : 'Active'}
                                                        variant={session.status === 'COMPLETED' ? 'success' : session.status === 'ABANDONED' ? 'error' : 'primary'}
                                                    />
                                                </HStack>
                                                <Text className="text-white font-bold text-lg">{session.dayNameSnapshot}</Text>
                                                <Text className="text-typography-500 text-sm font-medium">{session.programNameSnapshot}</Text>
                                            </VStack>
                                            <Box
                                                className="p-2 rounded-full"
                                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                            >
                                                <Icon as={ChevronRightIcon} size="sm" className="text-typography-400" />
                                            </Box>
                                        </HStack>
                                    </AppCard>
                                </Pressable>
                            ))
                        )}
                    </VStack>
                </ScrollView>
            </VStack>
        </Box>
    );
};
