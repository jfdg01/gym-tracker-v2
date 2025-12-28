import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { ChevronLeftIcon, CalendarIcon, DumbbellIcon, PencilIcon, CheckIcon } from 'lucide-react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { AppHeader } from '@/src/components/ui-library/AppHeader';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { EditWorkoutSetRow } from '@/src/components/ui-library/EditWorkoutSetRow';
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
    const [isEditing, setIsEditing] = useState(false);

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

    const handleUpdateSet = async (updatedData: Partial<WorkoutSet>) => {
        // Optimistic update logic or wait for server return
        const updatedSet = await WorkoutService.logSet(updatedData as any);
        setSets(prevSets => prevSets.map(s => s.id === updatedSet.id ? updatedSet : s));
    };

    if (loading) return (
        <Box className="flex-1 bg-surface-deep justify-center items-center">
            <Text className="text-typography-500 font-medium">Loading details...</Text>
        </Box>
    );

    if (!session) return (
        <Box className="flex-1 bg-surface-deep justify-center items-center p-6">
            <Text className="text-typography-400 text-center font-medium">Workout not found.</Text>
            <Button className="mt-4 bg-primary-energy rounded-full" onPress={() => router.back()}>
                <ButtonText className="font-bold">Back</ButtonText>
            </Button>
        </Box>
    );

    return (
        <Box className="flex-1 bg-surface-deep">
            <AppHeader
                title={session.dayNameSnapshot || 'Unknown Day'}
                subTitle={session.programNameSnapshot || undefined}
                showBack={true}
                rightElement={
                    <AppButton
                        title={isEditing ? "Done" : "Edit"}
                        icon={isEditing ? CheckIcon : PencilIcon}
                        onPress={() => setIsEditing(!isEditing)}
                        variant={isEditing ? "solid" : "outline"}
                        action={isEditing ? "primary" : "secondary"}
                        size="sm"
                        className="rounded-full"
                    />
                }
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="lg" className="p-4 pb-20">
                    <AppCard className="p-4">
                        <HStack space="md" className="items-center">
                            <Icon as={CalendarIcon} size="sm" className="text-primary-energy" />
                            <Text className="text-typography-500 font-semibold">
                                {session.completedAt ? formatDate(session.completedAt) : 'N/A'}
                            </Text>
                        </HStack>
                    </AppCard>

                    <Heading size="sm" className="text-typography-950 px-1 font-heading">Exercises</Heading>

                    {session.exercisesSnapshot?.map((ex) => {
                        const exerciseSets = sets.filter(s => s.exerciseId === ex.exerciseId);

                        return (
                            <VStack key={ex.programDayExerciseId} space="xs" className="mb-4">
                                <HStack space="xs" className="items-center px-1">
                                    <Icon as={DumbbellIcon} size="xs" className="text-primary-energy" />
                                    <Heading size="xs" className="text-typography-950 font-heading">{ex.exerciseName}</Heading>
                                </HStack>

                                <AppCard className="p-0 overflow-hidden">
                                    <VStack>
                                        <HStack
                                            className="py-2 px-3"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                        >
                                            <Text size="xs" className="w-10 text-typography-500 font-bold uppercase tracking-wider">SET</Text>
                                            <Text size="xs" className="flex-1 text-typography-500 font-bold uppercase tracking-wider">RESISTANCE</Text>
                                            <Text size="xs" className="flex-1 text-typography-500 font-bold uppercase tracking-wider">RESULT</Text>
                                        </HStack>

                                        {exerciseSets.length === 0 ? (
                                            <Box className="p-4 items-center">
                                                <Text size="xs" className="text-typography-500 italic">No sets logged</Text>
                                            </Box>
                                        ) : (
                                            exerciseSets.map((s, idx) => (
                                                isEditing ? (
                                                    <EditWorkoutSetRow
                                                        key={s.id}
                                                        setNumber={s.setNumber}
                                                        exercise={ex}
                                                        set={s}
                                                        onUpdate={handleUpdateSet}
                                                    />
                                                ) : (
                                                    <HStack
                                                        key={s.id}
                                                        className="py-3 px-3"
                                                        style={idx < exerciseSets.length - 1 ? { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' } : {}}
                                                    >
                                                        <Text size="sm" className="w-10 text-typography-400 font-bold">{s.setNumber}</Text>
                                                        <Box className="flex-1">
                                                            {s.skipped ? (
                                                                <Text size="sm" className="text-typography-600 italic">Skipped</Text>
                                                            ) : (
                                                                <Text size="sm" className="text-white">
                                                                    {ex.resistanceType === ResistanceType.WEIGHT ? `${s.weight} kg` : s.difficulty || 'N/A'}
                                                                </Text>
                                                            )}
                                                        </Box>
                                                        <Box className="flex-1">
                                                            {!s.skipped && (
                                                                <Text size="sm" className="text-white font-medium">
                                                                    {ex.trackingType === TrackingType.REPS ? `${s.reps} reps` : `${s.timeSeconds}s`}
                                                                </Text>
                                                            )}
                                                        </Box>
                                                    </HStack>
                                                )
                                            ))
                                        )}
                                    </VStack>
                                </AppCard>
                            </VStack>
                        );
                    })}
                </VStack>
            </ScrollView>
        </Box>
    );
};

