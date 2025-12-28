import React from 'react';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { AppHeader } from '@/src/components/ui-library/AppHeader';
import { TrophyIcon, DumbbellIcon, TrendingUpIcon, CheckCircleIcon, ArrowRightIcon } from 'lucide-react-native';
import { cn } from '@/src/utils/cn';

// We'll define the expected params interface
export interface WorkoutSummaryParams {
    sessionId: string;
    // JSON string of Record<string, { progressed: boolean, newWeight?: number, newDifficulty?: string, currentWeight?: number, currentDifficulty?: string, exerciseName: string }>
    progressionEvents: string;
    programName: string;
    dayName: string;
    duration: string;
    totalSets: string;
    completedSets: string;
}

interface ProgressionEvent {
    progressed: boolean;
    newWeight?: number;
    newDifficulty?: string;
    currentWeight?: number;
    currentDifficulty?: string;
    exerciseName: string;
}

interface WorkoutSummaryScreenProps {
    params: WorkoutSummaryParams;
}

export const WorkoutSummaryScreen = ({ params }: WorkoutSummaryScreenProps) => {
    const router = useRouter();

    // Parse progression events
    let achievements: Record<string, ProgressionEvent> = {};
    try {
        achievements = params.progressionEvents ? JSON.parse(params.progressionEvents) : {};
    } catch (e) {
        console.error("Failed to parse progression events", e);
    }

    const achievementCount = Object.keys(achievements).length;

    const handleDone = () => {
        router.dismissAll();
        router.replace('/(tabs)/history');
    };

    return (
        <Box className="flex-1 bg-surface-deep">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                <Box className="items-center pt-20 pb-10 px-6 bg-primary-energy/10 mb-6">
                    <Box className="w-20 h-20 rounded-full bg-primary-energy/20 items-center justify-center mb-4 border-2 border-primary-energy">
                        <Icon as={TrophyIcon} size="xl" className="text-primary-energy" />
                    </Box>
                    <Heading size="xl" className="text-white text-center font-heading uppercase tracking-wider mb-2">
                        Workout Complete!
                    </Heading>
                    <Text className="text-typography-400 text-center">
                        {params.programName} - {params.dayName}
                    </Text>
                    <Text className="text-typography-500 text-center text-sm mt-1">
                        {params.duration} • {params.completedSets} / {params.totalSets} sets
                    </Text>
                </Box>

                <VStack space="xl" className="px-6">
                    {Object.keys(achievements).length > 0 && (
                        <VStack space="md">
                            <HStack space="sm" className="items-center">
                                <Icon as={TrendingUpIcon} className="text-typography-400" />
                                <Heading size="md" className="text-white font-heading">Performance Results</Heading>
                            </HStack>

                            {Object.entries(achievements).map(([id, event]) => {
                                const isIncreased = event.progressed;
                                const isWeight = event.newWeight !== undefined || event.currentWeight !== undefined;

                                return (
                                    <Box
                                        key={id}
                                        className={cn(
                                            "p-4 rounded-xl border shadow-lg",
                                            isIncreased
                                                ? "bg-surface-elevated border-success-growth/30 shadow-success-growth/10"
                                                : "bg-surface-elevated border-white/5 shadow-black/20"
                                        )}
                                    >
                                        <HStack className="justify-between items-center mb-3">
                                            <HStack space="xs" className="items-center">
                                                <Icon as={DumbbellIcon} size="xs" className="text-typography-500" />
                                                <Text className="text-white font-bold">{event.exerciseName}</Text>
                                            </HStack>
                                            <Box className={cn(
                                                "px-2 py-0.5 rounded",
                                                isIncreased ? "bg-success-growth/20" : "bg-white/5"
                                            )}>
                                                <Text className={cn(
                                                    "text-[10px] font-black uppercase tracking-tighter",
                                                    isIncreased ? "text-success-growth" : "text-typography-500"
                                                )}>
                                                    {isIncreased ? "Increased" : "Maintained"}
                                                </Text>
                                            </Box>
                                        </HStack>

                                        <HStack className="items-center space-x-3">
                                            {isIncreased ? (
                                                <HStack space="md" className="items-center">
                                                    <VStack>
                                                        <Text className="text-[10px] text-typography-500 uppercase font-bold">From</Text>
                                                        <Text className="text-typography-400 font-bold text-lg">
                                                            {isWeight ? `${event.currentWeight || 0}kg` : event.currentDifficulty || 'None'}
                                                        </Text>
                                                    </VStack>
                                                    <Icon as={ArrowRightIcon} size="xs" className="text-success-growth" />
                                                    <VStack>
                                                        <Text className="text-[10px] text-success-growth uppercase font-black">To</Text>
                                                        <Text className="text-success-growth font-black text-2xl">
                                                            {isWeight ? `${event.newWeight}kg` : event.newDifficulty}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            ) : (
                                                <VStack>
                                                    <Text className="text-[10px] text-typography-500 uppercase font-bold">Current</Text>
                                                    <Text className="text-typography-400 font-bold text-xl">
                                                        {isWeight ? `${event.currentWeight || 0}kg` : event.currentDifficulty || 'None'}
                                                    </Text>
                                                </VStack>
                                            )}
                                        </HStack>
                                    </Box>
                                );
                            })}
                        </VStack>
                    )}

                    <VStack space="md">
                        <HStack space="sm" className="items-center">
                            <Icon as={CheckCircleIcon} className="text-typography-500" />
                            <Heading size="md" className="text-typography-400 font-heading">Summary</Heading>
                        </HStack>

                        <Box className="bg-surface-elevated p-6 rounded-xl border border-outline-100">
                            <Text className="text-typography-400 italic text-center">
                                {achievementCount > 0
                                    ? "Great job pushing your limits today! Recovery is key, make sure to get some rest."
                                    : "Good session! Consistency is the key to progress. Keep showing up!"}
                            </Text>
                        </Box>
                    </VStack>
                </VStack>
            </ScrollView>

            <Box className="p-6 bg-surface-deep border-t border-outline-100 safe-area-bottom">
                <Button
                    size="xl"
                    className="w-full bg-primary-energy rounded-full shadow-lg shadow-primary-energy/20"
                    onPress={handleDone}
                >
                    <ButtonText className="font-bold text-lg">Finish Workout</ButtonText>
                    <Icon as={ArrowRightIcon} className="text-white ml-2" />
                </Button>
            </Box>
        </Box>
    );
};
