import React, { useEffect, useState, useCallback } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
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

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

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
        <Box className="flex-1 bg-surface-deep px-4">
            <VStack space="md" className="flex-1 mt-12">
                <Heading className="text-typography-950 mb-4 font-heading">History</Heading>

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
                                    <Card className="p-4 mb-2 shadow-soft-1 border border-outline-dark/5">
                                        <HStack className="justify-between items-center">
                                            <VStack space="xs" className="flex-1">
                                                <HStack space="md" className="items-center">
                                                    <HStack space="xs" className="items-center">
                                                        <Icon as={CalendarIcon} size="xs" className="text-primary-energy" />
                                                        <Text className="text-typography-500 text-xs font-semibold">
                                                            {session.completedAt ? formatDate(session.completedAt) : 'In Progress'}
                                                        </Text>
                                                    </HStack>

                                                    {session.status === 'COMPLETED' ? (
                                                        <Box className="bg-success-500/10 px-2 py-0.5 rounded-full">
                                                            <Text className="text-success-growth text-[10px] font-bold uppercase">Success</Text>
                                                        </Box>
                                                    ) : session.status === 'ABANDONED' ? (
                                                        <Box className="bg-error-500/10 px-2 py-0.5 rounded-full">
                                                            <Text className="text-error-critical text-[10px] font-bold uppercase">Abandoned</Text>
                                                        </Box>
                                                    ) : (
                                                        <Box className="bg-primary-energy/10 px-2 py-0.5 rounded-full">
                                                            <Text className="text-primary-energy text-[10px] font-bold uppercase">Active</Text>
                                                        </Box>
                                                    )}
                                                </HStack>
                                                <Text className="text-typography-950 font-bold text-lg">{session.dayNameSnapshot}</Text>
                                                <Text className="text-typography-500 text-sm font-medium">{session.programNameSnapshot}</Text>
                                            </VStack>
                                            <Box className="bg-background-50/50 p-2 rounded-full">
                                                <Icon as={ChevronRightIcon} size="sm" className="text-typography-400" />
                                            </Box>
                                        </HStack>
                                    </Card>
                                </Pressable>
                            ))
                        )}
                    </VStack>
                </ScrollView>
            </VStack>
        </Box>
    );
};
