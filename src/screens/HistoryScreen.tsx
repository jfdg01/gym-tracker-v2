import React, { useState, useCallback } from 'react';
import { cn } from '@/src/utils/cn';
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
import { CalendarIcon, ChevronRightIcon, TrendingUpIcon, ClockIcon, DumbbellIcon, CoffeeIcon } from 'lucide-react-native';
import { WorkoutService } from '@/src/services/WorkoutService';
import { formatDuration } from '@/src/utils/time';
import { WorkoutSession } from '@/src/types/domain';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppScreenTitle } from '@/src/components/ui-library/AppScreenTitle';
import { StatusBadge } from '@/src/components/ui-library/StatusBadge';

import { StaggeredItem } from '@/src/components/ui-library/StaggeredItem';

export const HistoryScreen = () => {
    const router = useRouter();
    const [history, setHistory] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <Box className="flex-1 bg-surface-deep">
            <VStack space="md" className="flex-1 px-4 pt-12">
                <AppScreenTitle title="History" />

                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                >
                    <VStack space="sm" className="pb-24">
                        {history.length === 0 ? (
                            <Box className="py-20 items-center justify-center">
                                <Icon as={TrendingUpIcon} size="xl" className="text-typography-700 mb-4" />
                                <Text className="text-typography-500 text-center">No workouts completed yet. Your progress will appear here!</Text>
                            </Box>
                        ) : (
                            history.map((session, index) => (
                                <StaggeredItem
                                    key={session.id}
                                    index={index}
                                >
                                    <Pressable
                                        onPress={() => router.push(`/history/${session.id}`)}
                                    >
                                        <AppCard
                                            className={cn(
                                                "p-4 mb-3 border-l-4",
                                                session.isRestDay ? "border-l-blue-400" : "border-l-primary-energy"
                                            )}
                                        >
                                            <HStack className="justify-between items-center">
                                                <VStack space="sm" className="flex-1">
                                                    <HStack className="justify-between items-center pr-2">
                                                        <HStack space="xs" className="items-center">
                                                            <Icon
                                                                as={session.isRestDay ? CoffeeIcon : DumbbellIcon}
                                                                size="sm"
                                                                className={session.isRestDay ? "text-blue-400" : "text-primary-energy"}
                                                            />
                                                            <Text className="text-white font-bold text-lg">{session.dayNameSnapshot}</Text>
                                                        </HStack>
                                                        {session.status !== 'COMPLETED' && (
                                                            <StatusBadge
                                                                label={session.status === 'ABANDONED' ? 'Abandoned' : 'Active'}
                                                                variant={session.status === 'ABANDONED' ? 'error' : 'primary'}
                                                            />
                                                        )}
                                                    </HStack>

                                                    <HStack space="md" className="items-center">
                                                        <HStack space="xs" className="items-center">
                                                            <Icon as={CalendarIcon} size="xs" className="text-typography-500" />
                                                            <Text className="text-typography-500 text-xs font-medium">
                                                                {session.completedAt ? formatDate(session.completedAt) : 'In Progress'}
                                                            </Text>
                                                        </HStack>

                                                        {session.completedAt && (
                                                            <HStack space="xs" className="items-center border-l border-white/10 pl-3">
                                                                <Icon as={ClockIcon} size="xs" className="text-typography-500" />
                                                                <Text className="text-typography-500 text-xs font-medium">
                                                                    {formatDuration(session.startedAt, session.completedAt)}
                                                                </Text>
                                                            </HStack>
                                                        )}
                                                    </HStack>

                                                    <VStack space="xs" className="mt-1">
                                                        <Text className="text-typography-400 text-xs uppercase tracking-wider font-semibold">
                                                            {session.programNameSnapshot}
                                                        </Text>
                                                        {!session.isRestDay && session.exercisesSnapshot && (
                                                            <Text className="text-typography-500 text-xs font-medium">
                                                                {session.exercisesSnapshot.length} Exercises • {session.exercisesSnapshot.reduce((acc, ex) => acc + ex.sets, 0)} Sets
                                                            </Text>
                                                        )}
                                                        {session.isRestDay && (
                                                            <Text className="text-blue-400/80 text-xs font-medium italic">
                                                                Recovery Session
                                                            </Text>
                                                        )}
                                                    </VStack>
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
                                </StaggeredItem>
                            ))
                        )}
                    </VStack>
                </ScrollView>
            </VStack>
        </Box>
    );
};
