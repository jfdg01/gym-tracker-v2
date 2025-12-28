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

// We'll define the expected params interface
export interface WorkoutSummaryParams {
    sessionId: string;
    // JSON string of Record<string, { newWeight?: number, newDifficulty?: string, exerciseName: string }>
    progressionEvents: string;
    programName: string;
    dayName: string;
    duration: string;
}

interface ProgressionEvent {
    newWeight?: number;
    newDifficulty?: string;
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
                <Box className="items-center py-10 px-6 bg-primary-energy/10 mb-6">
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
                        {params.duration}
                    </Text>
                </Box>

                <VStack space="xl" className="px-6">
                    {achievementCount > 0 && (
                        <VStack space="md">
                            <HStack space="sm" className="items-center">
                                <Icon as={TrendingUpIcon} className="text-success-growth" />
                                <Heading size="md" className="text-white font-heading">Level Ups</Heading>
                            </HStack>

                            {Object.entries(achievements).map(([id, event]) => (
                                <Box key={id} className="bg-surface-elevated p-4 rounded-xl border border-success-growth/30 shadow-lg shadow-success-growth/10">
                                    <HStack className="justify-between items-center mb-2">
                                        <HStack space="xs" className="items-center">
                                            <Icon as={DumbbellIcon} size="xs" className="text-typography-500" />
                                            <Text className="text-white font-bold">{event.exerciseName}</Text>
                                        </HStack>
                                        <Box className="bg-success-growth/20 px-2 py-1 rounded">
                                            <Text className="text-success-growth text-xs font-bold uppercase">Upgrade</Text>
                                        </Box>
                                    </HStack>

                                    <HStack className="items-end">
                                        <Text className="text-typography-400 text-sm mr-2">New Milestone:</Text>
                                        <Text className="text-success-growth font-bold text-xl">
                                            {event.newWeight ? `${event.newWeight} kg` : event.newDifficulty}
                                        </Text>
                                    </HStack>
                                </Box>
                            ))}
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
