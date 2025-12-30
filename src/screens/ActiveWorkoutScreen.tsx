import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import {
    CheckIcon,
    Settings2Icon,
    CoffeeIcon,
} from 'lucide-react-native';
import { useWorkout } from '@/src/hooks/useWorkout';
import { useRestTimer } from '@/src/components/RestTimerContext';
import { WorkoutSet } from '@/src/types/domain';
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetItem,
    ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { AppHeader } from '@/src/components/ui-library/AppHeader';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { ActiveExerciseCard } from '@/src/components/ui-library/ActiveExerciseCard';
import { WorkoutSetRow } from '@/src/components/ui-library/WorkoutSetRow';
import { AppAlert } from '@/src/components/ui-library/AppAlert';
import { Logger } from '@/src/utils/Logger';

import { ActiveSetFocus } from '@/src/components/ui-library/ActiveSetFocus';
import { WorkoutCompleteCard } from '@/src/components/ui-library/WorkoutCompleteCard';
import { formatDuration } from '../utils/time';

export const ActiveWorkoutScreen = () => {
    const router = useRouter();
    const { activeSession, sessionSets, logSet, completeWorkout, abandonWorkout, loading } = useWorkout();
    const { timeLeft, initialTime, endTime, isActive, startTimer, stopTimer } = useRestTimer();

    const [focusedExerciseId, setFocusedExerciseId] = useState<string | null>(null);
    const [focusedSetNumber, setFocusedSetNumber] = useState<number>(1);

    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showActionsheet, setShowActionsheet] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string, message: string, onConfirm: () => void, action?: 'primary' | 'positive' | 'negative' | 'destructive' }>({
        title: '',
        message: '',
        onConfirm: () => { }
    });
    const [isLoggingSet, setIsLoggingSet] = useState(false);
    const [progressionEvents, setProgressionEvents] = useState<Record<string, { newWeight?: number, newDifficulty?: string, exerciseName: string, isMaxLevel?: boolean }>>({});

    // Group sets by exerciseId to avoid filtering in the render loop
    const setsByExercise = useMemo(() => {
        const stopTimer = Logger.getTimer('Screen: ActiveWorkoutScreen.computeSetsByExercise');
        const grouped: Record<string, WorkoutSet[]> = {};
        sessionSets.forEach(set => {
            if (!grouped[set.exerciseId]) {
                grouped[set.exerciseId] = [];
            }
            grouped[set.exerciseId].push(set);
        });
        stopTimer();
        return grouped;
    }, [sessionSets]);

    /** Auto-advances focus to the next unlogged set. */
    const findNextSet = useCallback((setsOverride?: WorkoutSet[]) => {
        if (!activeSession) return;

        const stopTimer = Logger.getTimer('Screen: ActiveWorkoutScreen.findNextSet');
        const currentSets = setsOverride || sessionSets;

        for (const ex of activeSession.exercisesSnapshot || []) {
            for (let i = 1; i <= ex.sets; i++) {
                const isLogged = currentSets.some(s => s.exerciseId === ex.exerciseId && s.setNumber === i);
                if (!isLogged) {
                    setFocusedExerciseId(ex.exerciseId);
                    setFocusedSetNumber(i);
                    stopTimer();
                    return;
                }
            }
        }
        stopTimer();
    }, [activeSession, sessionSets]);

    /** Initializes focus on mount or session load. */
    useEffect(() => {
        if (activeSession && !focusedExerciseId) {
            findNextSet();
        }
    }, [activeSession, focusedExerciseId, findNextSet]);

    /** Auto-expands the exercise card that is currently in focus. */
    useEffect(() => {
        if (focusedExerciseId && activeSession) {
            const exercise = activeSession.exercisesSnapshot?.find(e => e.exerciseId === focusedExerciseId);
            if (exercise) {
                setExpandedExercise(exercise.programDayExerciseId);
            }
        }
    }, [focusedExerciseId, activeSession]);

    const handleLogSet = async (data: Partial<WorkoutSet>) => {
        if (isLoggingSet) return;
        setIsLoggingSet(true);

        try {
            const result = await logSet(data as any);

            // Calculate optimistic/new sets state to avoid race conditions with findNextSet
            let nextSets = [...sessionSets];
            if (result && result.set) {
                const index = nextSets.findIndex(s => s.exerciseId === data.exerciseId && s.setNumber === data.setNumber);
                if (index !== -1) {
                    nextSets[index] = result.set;
                } else {
                    nextSets = [...nextSets, result.set].sort((a, b) => a.setNumber - b.setNumber);
                }
            }

            if (!data.skipped) {
                const exerciseSnapshot = activeSession?.exercisesSnapshot?.find(e => e.exerciseId === data.exerciseId);
                const restDuration = exerciseSnapshot?.restTimeSeconds || 90;
                startTimer(restDuration);

                if (result && result.progression) {
                    const exerciseSnapshot = activeSession?.exercisesSnapshot?.find(e => e.exerciseId === data.exerciseId);
                    const exerciseName = exerciseSnapshot?.exerciseName || 'Exercise';
                    const isWeight = exerciseSnapshot?.resistanceType === 'Weight';

                    setProgressionEvents(prev => ({
                        ...prev,
                        [data.exerciseId!]: {
                            progressed: result.progression!.progressed,
                            newWeight: result.progression!.newWeight,
                            newDifficulty: result.progression!.newDifficulty,
                            currentWeight: isWeight ? exerciseSnapshot?.suggestedWeight || undefined : undefined,
                            currentDifficulty: !isWeight ? (exerciseSnapshot?.suggestedDifficulty || exerciseSnapshot?.difficultyLevels?.[0]) : undefined,
                            isMaxLevel: result.progression!.isMaxLevel,
                            exerciseName
                        }
                    }));
                }
            }

            findNextSet(nextSets);
        } catch (error) {
            console.error("Failed to log set:", error);
        } finally {
            setIsLoggingSet(false);
        }
    };

    const handleConfirmFinish = async () => {
        if (!activeSession || isFinishing) return;
        const currentSessionId = activeSession.id;
        setIsFinishing(true);

        const totalSets = activeSession.exercisesSnapshot?.reduce((acc, ex) => acc + ex.sets, 0) || 0;
        const completedSets = sessionSets.filter(s => !s.skipped).length;

        try {
            await completeWorkout(currentSessionId);
            router.replace({
                pathname: '/workout-summary',
                params: {
                    sessionId: currentSessionId,
                    progressionEvents: JSON.stringify(progressionEvents),
                    programName: activeSession.programNameSnapshot || 'Workout',
                    dayName: activeSession.dayNameSnapshot || 'Session',
                    duration: formatDuration(activeSession.startedAt, new Date()),
                    totalSets: totalSets.toString(),
                    completedSets: completedSets.toString(),
                    isRestDay: activeSession.isRestDay ? 'true' : 'false',
                }
            });
        } catch (error) {
            console.error("Failed to complete workout:", error);
            setIsFinishing(false);
        }
    };

    const handleConfirmAbandon = async () => {
        if (isFinishing) return;
        setIsFinishing(true);
        try {
            await abandonWorkout();
            router.replace('/(tabs)');
        } catch (error) {
            console.error("Failed to abandon workout:", error);
            setIsFinishing(false);
        }
    };

    const handlePressFinish = () => {
        setShowActionsheet(false);
        const completedSetsCount = sessionSets.filter(s => !s.skipped).length;
        const totalSetsRequired = activeSession?.exercisesSnapshot?.reduce((acc, ex) => acc + ex.sets, 0) || 0;
        const totalLoggedCount = sessionSets.length;

        if (completedSetsCount === 0) {
            setAlertConfig({
                title: "Finish Workout",
                message: "Are you sure? There's not sets done.",
                onConfirm: handleConfirmFinish
            });
            setShowAlert(true);
        } else if (totalLoggedCount < totalSetsRequired) {
            setAlertConfig({
                title: "Finish Workout",
                message: "Are you sure? You are missing some sets.",
                onConfirm: handleConfirmFinish
            });
            setShowAlert(true);
        } else {
            handleConfirmFinish();
        }
    };

    const handlePressAbandon = () => {
        setShowActionsheet(false);
        const completedSetsCount = sessionSets.filter(s => !s.skipped).length;

        if (completedSetsCount > 0) {
            setAlertConfig({
                title: "Abandon Workout",
                message: "Are you sure? You will miss your current progress.",
                onConfirm: handleConfirmAbandon,
                action: 'destructive'
            });
            setShowAlert(true);
        } else {
            handleConfirmAbandon();
        }
    };

    if (loading || (isFinishing && !activeSession)) return (
        <Box className="flex-1 bg-surface-deep justify-center items-center">
            <Text className="text-typography-500">{isFinishing ? "Finishing workout..." : "Loading session..."}</Text>
        </Box>
    );

    if (!activeSession && !isFinishing) return (
        <Box className="flex-1 bg-surface-deep justify-center items-center p-6">
            <VStack space="md" className="items-center">
                <Text className="text-typography-400 text-center">No active session found.</Text>
                <AppButton title="Go Home" onPress={() => router.replace('/(tabs)')} action="primary" />
            </VStack>
        </Box>
    );

    const rightHeaderElement = (
        <AppButton
            title=""
            icon={Settings2Icon}
            variant="outline"
            onPress={() => setShowActionsheet(true)}
            size="sm"
            className="w-10 h-10 p-0 rounded-full border-white/10"
        />
    );

    const focusedExercise = activeSession?.exercisesSnapshot?.find(e => e.exerciseId === focusedExerciseId);
    const focusedExistingSet = sessionSets.find(s => s.exerciseId === focusedExerciseId && s.setNumber === focusedSetNumber);

    // Find the last completed set for this specific exercise to use as default values
    const exerciseSets = focusedExerciseId ? (setsByExercise[focusedExerciseId] || []) : [];
    const previousCompletedSet = [...exerciseSets].reverse().find(s => !s.skipped);

    const totalSetsRequired = activeSession?.exercisesSnapshot?.reduce((acc, ex) => acc + ex.sets, 0) || 0;
    const isWorkoutComplete = sessionSets.length >= totalSetsRequired && totalSetsRequired > 0;

    return (
        <Box className="flex-1 bg-surface-deep">
            <AppHeader
                title={activeSession!.dayNameSnapshot || 'Workout'}
                subTitle={activeSession!.programNameSnapshot || ''}
                rightElement={!isWorkoutComplete && !activeSession?.isRestDay ? rightHeaderElement : null}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="xl" className="p-4 pb-48">

                    {activeSession?.isRestDay ? (
                        <VStack space="xl" className="items-center justify-center pt-8">
                            <Box className="w-24 h-24 rounded-full bg-primary-energy/10 items-center justify-center mb-4">
                                <Icon as={CoffeeIcon} size="xl" className="text-primary-energy" />
                            </Box>
                            <VStack space="xs" className="items-center">
                                <Heading size="lg" className="text-white text-center">Rest Day</Heading>
                                <Text className="text-typography-400 text-center px-6">
                                    Take it easy! Today is for recovery. You can complete this day whenever you're ready.
                                </Text>
                            </VStack>

                            <AppButton
                                title="Complete Rest Day"
                                onPress={handleConfirmFinish}
                                action="positive"
                                className="w-full mt-8"
                                size="lg"
                            />
                        </VStack>
                    ) : isWorkoutComplete ? (
                        <WorkoutCompleteCard onFinish={handleConfirmFinish} />
                    ) : (
                        focusedExercise && (
                            <ActiveSetFocus
                                exercise={focusedExercise}
                                setNumber={focusedSetNumber}
                                existingSet={focusedExistingSet}
                                previousSet={previousCompletedSet}
                                onLog={handleLogSet}
                                onSkip={handleLogSet} // skip is same as log with skipped:true
                                isLogging={isLoggingSet}
                                timerActive={isActive}
                                timeLeft={timeLeft}
                                initialTime={initialTime}
                                endTime={endTime}
                                onSkipTimer={stopTimer}
                                onAddMoreTimer={() => startTimer(timeLeft + 30)}
                            />
                        )
                    )}

                    <VStack space="md">
                        {!activeSession?.isRestDay && (
                            <Text size="xs" className="text-typography-500 font-bold uppercase tracking-widest ml-1">
                                Workout Details
                            </Text>
                        )}
                        {activeSession!.exercisesSnapshot?.map((ex) => {
                            const isExpanded = expandedExercise === ex.programDayExerciseId;
                            const exerciseSets = setsByExercise[ex.exerciseId] || [];
                            const completedCount = exerciseSets.filter(s => !s.skipped).length;

                            return (
                                <ActiveExerciseCard
                                    key={ex.programDayExerciseId}
                                    exercise={ex}
                                    completedSets={completedCount}
                                    isExpanded={isExpanded}
                                    onToggle={() => setExpandedExercise(isExpanded ? "" : ex.programDayExerciseId)}
                                >
                                    {Array.from({ length: ex.sets }).map((_, i) => (
                                        <WorkoutSetRow
                                            key={`${ex.exerciseId}-${i + 1}`}
                                            setNumber={i + 1}
                                            exercise={ex}
                                            existingSet={exerciseSets.find(s => s.setNumber === i + 1)}
                                            isFocused={focusedExerciseId === ex.exerciseId && focusedSetNumber === i + 1}
                                            onFocus={(num) => {
                                                setFocusedExerciseId(ex.exerciseId);
                                                setFocusedSetNumber(num);
                                            }}
                                        />
                                    ))}
                                </ActiveExerciseCard>
                            );
                        })}
                    </VStack>
                </VStack>
            </ScrollView>

            <Actionsheet isOpen={showActionsheet} onClose={() => setShowActionsheet(false)}>
                <ActionsheetBackdrop />
                <ActionsheetContent className="pb-8">
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>

                    <ActionsheetItem
                        onPress={handlePressFinish}
                        className="flex-col items-start p-4"
                    >
                        <ActionsheetItemText className="font-bold text-xl">Finish Workout</ActionsheetItemText>
                        <Text size="sm" className="text-typography-500 mt-1">
                            Only the sets you've actually completed will be logged. Progression is not calculated for workouts finished early.
                        </Text>
                    </ActionsheetItem>

                    <ActionsheetItem
                        onPress={handlePressAbandon}
                        className="flex-col items-start p-4"
                    >
                        <ActionsheetItemText className="text-error-600 font-bold text-xl">Abandon Workout</ActionsheetItemText>
                        <Text size="sm" className="text-typography-500 mt-1">
                            The workout will not be logged at all and all progress will be lost.
                        </Text>
                    </ActionsheetItem>
                </ActionsheetContent>
            </Actionsheet>

            <AppAlert
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={[
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Confirm",
                        onPress: () => {
                            setShowAlert(false);
                            alertConfig.onConfirm();
                        },
                        style: alertConfig.action === 'destructive' ? 'destructive' : 'default'
                    }
                ]}
            />
        </Box>
    );
};
