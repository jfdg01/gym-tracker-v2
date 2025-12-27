import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, Vibration } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import {
    ChevronLeftIcon,
    CheckIcon,
    XIcon,
    ClockIcon,
    DumbbellIcon,
    TimerIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    SkipForwardIcon
} from 'lucide-react-native';
import { useWorkout } from '@/src/hooks/useWorkout';
import { useRestTimer } from '@/src/components/RestTimerContext';
import { ExerciseSnapshotItem, WorkoutSet, TrackingType, ResistanceType } from '@/src/types/domain';
import { Input, InputField } from '@/components/ui/input';
import { ExerciseRepository } from '../repositories/ExerciseRepository';

// Component for a single set row
const ActiveSetRow = React.memo(({
    setNumber,
    exercise,
    existingSet,
    onLog
}: {
    setNumber: number,
    exercise: ExerciseSnapshotItem,
    existingSet?: WorkoutSet,
    onLog: (data: Partial<WorkoutSet>) => void
}) => {
    // Hybrid Ref Pattern for inputs to avoid jitter
    const [weight, setWeight] = useState(existingSet?.weight?.toString() || '');
    const [reps, setReps] = useState(existingSet?.reps?.toString() || '');
    const [time, setTime] = useState(existingSet?.timeSeconds?.toString() || '');
    const [difficulty, setDifficulty] = useState(existingSet?.difficulty || '');
    const [logged, setLogged] = useState(!!existingSet && !existingSet.skipped);
    const [skipped, setSkipped] = useState(existingSet?.skipped || false);

    const handleLog = () => {
        if (skipped) return;
        onLog({
            setNumber,
            exerciseId: exercise.exerciseId,
            weight: exercise.resistanceType === ResistanceType.WEIGHT ? parseFloat(weight) : null,
            reps: exercise.trackingType === TrackingType.REPS ? parseInt(reps) : null,
            timeSeconds: exercise.trackingType === TrackingType.TIME ? parseInt(time) : null,
            difficulty: exercise.resistanceType === ResistanceType.DIFFICULTY ? difficulty : null,
            skipped: false
        });
        Vibration.vibrate(12);
        setLogged(true);
    };

    const handleSkip = () => {
        onLog({
            setNumber,
            exerciseId: exercise.exerciseId,
            skipped: true
        });
        setSkipped(true);
        setLogged(false);
    };

    const isReps = exercise.trackingType === TrackingType.REPS;
    const isWeight = exercise.resistanceType === ResistanceType.WEIGHT;

    return (
        <HStack space="md" className={`items-center py-3 px-3 rounded-xl mb-1 ${logged ? 'bg-success-500/10' : skipped ? 'bg-background-50/50 opacity-40' : 'bg-background-50/20'}`}>
            <Box className="w-8 items-center">
                <Text size="sm" className="font-bold text-typography-500">{setNumber}</Text>
            </Box>

            {isWeight ? (
                <Box className="flex-1">
                    <Input size="sm" variant="underlined">
                        <InputField
                            placeholder="kg"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                            className="text-typography-900 font-medium"
                        />
                    </Input>
                </Box>
            ) : (
                <Box className="flex-1">
                    <Text size="xs" className="text-typography-500">{exercise.resistanceType}</Text>
                </Box>
            )}

            <Box className="flex-1">
                <Input size="sm" variant="underlined">
                    <InputField
                        placeholder={isReps ? "reps" : "secs"}
                        keyboardType="numeric"
                        value={isReps ? reps : time}
                        onChangeText={isReps ? setReps : setTime}
                        className="text-typography-900 font-medium"
                    />
                </Input>
            </Box>

            <HStack space="xs">
                {skipped ? (
                    <Button size="xs" variant="link" onPress={() => setSkipped(false)}>
                        <ButtonText size="xs" className="text-primary-500">UNSKIP</ButtonText>
                    </Button>
                ) : (
                    <>
                        <Button
                            size="sm"
                            variant="link"
                            onPress={handleSkip}
                        >
                            <Icon as={SkipForwardIcon} size="xs" className="text-typography-400" />
                        </Button>
                        <Button
                            size="md"
                            action={logged ? "positive" : "primary"}
                            variant={logged ? "solid" : "outline"}
                            className="w-11 h-11 rounded-full p-0 flex items-center justify-center border-2 shadow-sm"
                            onPress={handleLog}
                        >
                            <Icon as={CheckIcon} size="md" className={logged ? "text-white" : "text-primary-energy"} />
                        </Button>
                    </>
                )}
            </HStack>
        </HStack>
    );
}, (prev, next) => prev.existingSet?.id === next.existingSet?.id && prev.setNumber === next.setNumber && prev.exercise.exerciseId === next.exercise.exerciseId);

export const ActiveWorkoutScreen = () => {
    const router = useRouter();
    const { activeSession, sessionSets, logSet, completeWorkout, abandonWorkout, loading } = useWorkout();
    const { timeLeft, isActive, startTimer } = useRestTimer();
    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

    const handleLogSet = async (data: Partial<WorkoutSet>) => {
        await logSet(data as any);
        // Start rest timer if needed
        if (!data.skipped) {
            startTimer(90); // Default 90s, could be from settings
        }
    };

    const handleFinish = () => {
        Alert.alert(
            "Finish Workout",
            "Are you sure you want to complete this session?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Finish",
                    onPress: async () => {
                        await completeWorkout();
                        router.replace('/(tabs)/history');
                    }
                }
            ]
        );
    };

    const handleAbandon = () => {
        Alert.alert(
            "Abandon Workout",
            "This will clear your current progress. Are you sure?",
            [
                { text: "Keep Going", style: "cancel" },
                {
                    text: "Abandon",
                    style: "destructive",
                    onPress: async () => {
                        await abandonWorkout();
                        router.replace('/(tabs)');
                    }
                }
            ]
        );
    };

    if (loading) return (
        <Box className="flex-1 bg-background-dark justify-center items-center">
            <Text className="text-typography-500">Loading session...</Text>
        </Box>
    );

    if (!activeSession) return (
        <Box className="flex-1 bg-background-dark justify-center items-center p-6">
            <VStack space="md" className="items-center">
                <Text className="text-typography-400 text-center">No active session found.</Text>
                <Button onPress={() => router.replace('/(tabs)')}>
                    <ButtonText>Go Home</ButtonText>
                </Button>
            </VStack>
        </Box>
    );

    return (
        <Box className="flex-1 bg-surface-deep">
            {/* Header */}
            <VStack className="pt-12 pb-4 px-4 bg-surface-deep border-b border-outline-dark/10 shadow-sm">
                <HStack className="justify-between items-center">
                    <HStack space="md" className="items-center flex-1">
                        <Pressable onPress={() => router.back()} hitSlop={20}>
                            <Icon as={ChevronLeftIcon} size="xl" className="text-typography-500" />
                        </Pressable>
                        <VStack className="flex-1">
                            <Heading size="md" className="text-typography-900" numberOfLines={1}>
                                {activeSession.dayNameSnapshot}
                            </Heading>
                            <Text size="xs" className="text-typography-500 uppercase tracking-tighter">
                                {activeSession.programNameSnapshot}
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack space="sm">
                        <Button size="sm" variant="outline" action="negative" onPress={handleAbandon}>
                            <Icon as={XIcon} size="xs" className="text-error-500" />
                        </Button>
                        <Button size="sm" action="positive" onPress={handleFinish}>
                            <ButtonText className="font-bold">FINISH</ButtonText>
                        </Button>
                    </HStack>
                </HStack>
            </VStack>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="lg" className="p-4 pb-48">
                    {activeSession.exercisesSnapshot?.map((ex, idx) => {
                        const isExpanded = expandedExercise === ex.programDayExerciseId || (expandedExercise === null && idx === 0);
                        const exerciseSets = sessionSets.filter(s => s.exerciseId === ex.exerciseId);
                        const completedCount = exerciseSets.filter(s => !s.skipped).length;

                        return (
                            <Card key={ex.programDayExerciseId} className="p-0 overflow-hidden bg-surface-elevated border-0 shadow-sm">
                                <Pressable
                                    onPress={() => setExpandedExercise(isExpanded ? "" : ex.programDayExerciseId)}
                                    className="p-4"
                                >
                                    <HStack className="justify-between items-center">
                                        <HStack space="md" className="items-center flex-1">
                                            <Box className="w-12 h-12 rounded-xl bg-primary-energy/10 items-center justify-center">
                                                <Icon as={DumbbellIcon} size="md" className="text-primary-energy" />
                                            </Box>
                                            <VStack className="flex-1">
                                                <Heading size="sm" className="text-typography-950">{ex.exerciseName}</Heading>
                                                <Text size="xs" className="text-typography-500 font-medium">
                                                    {completedCount} / {ex.sets} sets • {ex.resistanceType}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} size="sm" className="text-typography-400" />
                                    </HStack>
                                </Pressable>

                                {isExpanded && (
                                    <VStack className="px-4 pb-4 border-t border-outline-dark/30 pt-4" space="xs">
                                        {Array.from({ length: ex.sets }).map((_, i) => (
                                            <ActiveSetRow
                                                key={`${ex.exerciseId}-${i + 1}`}
                                                setNumber={i + 1}
                                                exercise={ex}
                                                existingSet={exerciseSets.find(s => s.setNumber === i + 1)}
                                                onLog={handleLogSet}
                                            />
                                        ))}
                                    </VStack>
                                )}
                            </Card>
                        );
                    })}
                </VStack>
            </ScrollView>

            {/* Rest Timer Overlay */}
            {isActive && (
                <Box className="absolute inset-0 bg-surface-deep/90 justify-center items-center z-50">
                    <VStack space="2xl" className="items-center">
                        <Box className="w-64 h-64 rounded-full border-8 border-accent-warning items-center justify-center">
                            <VStack className="items-center">
                                <Text className="text-accent-warning font-bold text-6xl font-space-mono tracking-tighter">{timeLeft}s</Text>
                                <Text className="text-typography-400 font-bold uppercase tracking-widest text-sm">Rest Active</Text>
                            </VStack>
                        </Box>

                        <HStack space="lg">
                            <Button
                                size="xl"
                                variant="outline"
                                className="rounded-full px-8 py-4 border-2 border-white/20"
                                onPress={() => startTimer(0)}
                            >
                                <Icon as={XIcon} className="text-white mr-2" />
                                <ButtonText className="text-white font-bold">SKIP</ButtonText>
                            </Button>
                            <Button
                                size="xl"
                                action="primary"
                                className="bg-primary-energy rounded-full px-8 py-4 shadow-xl"
                                onPress={() => startTimer(timeLeft + 30)}
                            >
                                <ButtonText className="text-white font-bold">+30s</ButtonText>
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            )}
        </Box>
    );
};
