import React, { useState, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { TrendingUpIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { WorkoutService } from '@/src/services/WorkoutService';
import { WorkoutSession } from '@/src/types/domain';
import { AppScreenTitle } from '@/src/components/ui-library/AppScreenTitle';
import { HistoryItem } from '@/src/components/ui-library/HistoryItem';

export const HistoryScreen = () => {
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

    const renderItem = useCallback(({ item, index }: { item: WorkoutSession, index: number }) => (
        <HistoryItem session={item} index={index} />
    ), []);

    return (
        <Box className="flex-1 bg-surface-deep">
            <VStack space="md" className="flex-1 px-4 pt-12">
                <AppScreenTitle title="History" />

                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <Box className="py-20 items-center justify-center">
                                <Icon as={TrendingUpIcon} size="xl" className="text-typography-700 mb-4" />
                                <Text className="text-typography-500 text-center">No workouts completed yet. Your progress will appear here!</Text>
                            </Box>
                        ) : null
                    }
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                />
            </VStack>
        </Box>
    );
};
