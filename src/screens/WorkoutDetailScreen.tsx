import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { ChevronLeftIcon, CalendarIcon, DumbbellIcon, InfoIcon } from 'lucide-react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { WorkoutService } from '@/src/services/WorkoutService';
import { WorkoutSession, WorkoutSet, ResistanceType, TrackingType } from '@/src/types/domain';

interface WorkoutDetailScreenProps {
    id: string;
}

export const WorkoutDetailScreen = ({ id }: WorkoutDetailScreenProps) => {
    const router = useRouter();
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [sets, setSets] = useState<WorkoutSet[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { session: s, sets: st } = await WorkoutService.getWorkoutDetails(id);
            setSession(s);
            setSets(st);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return (
        <Box className="flex-1 bg-background-dark justify-center items-center">
            <Text className="text-typography-500">Loading details...</Text>
        </Box>
    );

    if (!session) return (
        <Box className="flex-1 bg-background-dark justify-center items-center p-6">
            <Text className="text-typography-400 text-center">Workout not found.</Text>
            <Button className="mt-4" onPress={() => router.back()}>
                <ButtonText>Back</ButtonText>
            </Button>
        </Box>
    );

    return (
        <Box className="flex-1 bg-background-dark">
            {/* Header */}
            <VStack className="pt-12 pb-4 px-4 bg-surface-dark border-b border-outline-dark">
                <HStack space="md" className="items-center">
                    <Pressable onPress={() => router.back()}>
                        <Icon as={ChevronLeftIcon} size="xl" className="text-typography-500" />
                    </Pressable>
                    <VStack className="flex-1">
                        <Heading size="md" className="text-typography-900">{session.dayNameSnapshot}</Heading>
                        <Text size="xs" className="text-typography-500">{session.programNameSnapshot}</Text>
                    </VStack>
                </HStack>
            </VStack>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="lg" className="p-4 pb-20">
                    <Card className="bg-surface-elevated border-0 p-4">
                        <HStack space="md" className="items-center">
                            <Icon as={CalendarIcon} size="sm" className="text-primary-500" />
                            <Text className="text-typography-300 font-medium">
                                {session.completedAt ? formatDate(session.completedAt) : 'N/A'}
                            </Text>
                        </HStack>
                    </Card>

                    <Heading size="sm" className="text-typography-900 px-1">Exercises</Heading>

                    {session.exercisesSnapshot?.map((ex) => {
                        const exerciseSets = sets.filter(s => s.exerciseId === ex.exerciseId);

                        return (
                            <VStack key={ex.programDayExerciseId} space="xs" className="mb-4">
                                <HStack space="xs" className="items-center px-1">
                                    <Icon as={DumbbellIcon} size="xs" className="text-primary-500" />
                                    <Heading size="xs" className="text-typography-900">{ex.exerciseName}</Heading>
                                </HStack>

                                <Card className="bg-surface-elevated border-0 p-2">
                                    <VStack>
                                        <HStack className="bg-surface-dark/50 py-2 px-3 rounded-t-lg">
                                            <Text size="xs" className="w-10 text-typography-500 font-bold">SET</Text>
                                            <Text size="xs" className="flex-1 text-typography-500 font-bold">RESISTANCE</Text>
                                            <Text size="xs" className="flex-1 text-typography-500 font-bold">RESULT</Text>
                                        </HStack>

                                        {exerciseSets.length === 0 ? (
                                            <Box className="p-4 items-center">
                                                <Text size="xs" className="text-typography-500 italic">No sets logged</Text>
                                            </Box>
                                        ) : (
                                            exerciseSets.map((s, idx) => (
                                                <HStack
                                                    key={s.id}
                                                    className={`py-3 px-3 ${idx < exerciseSets.length - 1 ? 'border-b border-outline-dark/20' : ''}`}
                                                >
                                                    <Text size="sm" className="w-10 text-typography-400 font-bold">{s.setNumber}</Text>
                                                    <Box className="flex-1">
                                                        {s.skipped ? (
                                                            <Text size="sm" className="text-typography-600 italic">Skipped</Text>
                                                        ) : (
                                                            <Text size="sm" className="text-typography-200">
                                                                {ex.resistanceType === ResistanceType.WEIGHT ? `${s.weight} kg` : s.difficulty || 'N/A'}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                    <Box className="flex-1">
                                                        {!s.skipped && (
                                                            <Text size="sm" className="text-typography-200 font-medium">
                                                                {ex.trackingType === TrackingType.REPS ? `${s.reps} reps` : `${s.timeSeconds}s`}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                </HStack>
                                            ))
                                        )}
                                    </VStack>
                                </Card>
                            </VStack>
                        );
                    })}
                </VStack>
            </ScrollView>
        </Box>
    );
};

