import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import {
    CheckIcon,
    XIcon,
} from 'lucide-react-native';
import { useWorkout } from '@/src/hooks/useWorkout';
import { useRestTimer } from '@/src/components/RestTimerContext';
import { WorkoutSet } from '@/src/types/domain';
import { AppHeader } from '@/src/components/ui-library/AppHeader';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { ActiveExerciseCard } from '@/src/components/ui-library/ActiveExerciseCard';
import { WorkoutSetRow } from '@/src/components/ui-library/WorkoutSetRow';
import { RestTimerOverlay } from '@/src/components/ui-library/RestTimerOverlay';
import { AppAlert } from '@/src/components/ui-library/AppAlert';


import { ActiveSetFocus } from '@/src/components/ui-library/ActiveSetFocus';
import { WorkoutCompleteCard } from '@/src/components/ui-library/WorkoutCompleteCard';
import { formatDuration } from '../utils/time';

export const ActiveWorkoutScreen = () => {
    const router = useRouter();
    const { activeSession, sessionSets, logSet, completeWorkout, abandonWorkout, loading } = useWorkout();
    const { timeLeft, isActive, startTimer } = useRestTimer();

    // UI State for focused tracking
    const [focusedExerciseId, setFocusedExerciseId] = useState<string | null>(null);
    const [focusedSetNumber, setFocusedSetNumber] = useState<number>(1);

    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showFinishAlert, setShowFinishAlert] = useState(false);
    const [showAbandonAlert, setShowAbandonAlert] = useState(false);
    const [isLoggingSet, setIsLoggingSet] = useState(false);
    const [progressionEvents, setProgressionEvents] = useState<Record<string, { newWeight?: number, newDifficulty?: string, exerciseName: string }>>({});

    // Auto-advance to next unlogged set
    const findNextSet = useCallback((setsOverride?: WorkoutSet[]) => {
        if (!activeSession) return;

        const currentSets = setsOverride || sessionSets;

        for (const ex of activeSession.exercisesSnapshot || []) {
            for (let i = 1; i <= ex.sets; i++) {
                const isLogged = currentSets.some(s => s.exerciseId === ex.exerciseId && s.setNumber === i);
                if (!isLogged) {
                    setFocusedExerciseId(ex.exerciseId);
                    setFocusedSetNumber(i);
                    return;
                }
            }
        }
    }, [activeSession, sessionSets]);

    // Initialize focus on mount or session load
    useEffect(() => {
        if (activeSession && !focusedExerciseId) {
            findNextSet();
        }
    }, [activeSession, focusedExerciseId, findNextSet]);

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
                startTimer(90);

                if (result && result.progression && result.progression.progressed) {
                    const exerciseName = activeSession?.exercisesSnapshot?.find(e => e.exerciseId === data.exerciseId)?.exerciseName || 'Exercise';
                    setProgressionEvents(prev => ({
                        ...prev,
                        [data.exerciseId!]: {
                            newWeight: result.progression!.newWeight,
                            newDifficulty: result.progression!.newDifficulty,
                            exerciseName
                        }
                    }));
                }
            }

            // Auto-advance using the NEW sets state
            findNextSet(nextSets);
        } catch (error) {
            console.error("Failed to log set:", error);
        } finally {
            setIsLoggingSet(false);
        }
    };

    const handleFinish = () => setShowFinishAlert(true);

    const handleConfirmFinish = async () => {
        if (!activeSession || isFinishing) return;
        const currentSessionId = activeSession.id;
        setShowFinishAlert(false);
        setIsFinishing(true);

        try {
            await completeWorkout(currentSessionId);
            router.replace({
                pathname: '/workout-summary',
                params: {
                    sessionId: currentSessionId,
                    progressionEvents: JSON.stringify(progressionEvents),
                    programName: activeSession.programNameSnapshot || 'Workout',
                    dayName: activeSession.dayNameSnapshot || 'Session',
                    duration: formatDuration(activeSession.startedAt, new Date())
                }
            });
        } catch (error) {
            console.error("Failed to complete workout:", error);
            setIsFinishing(false);
        }
    };

    const handleAbandon = () => setShowAbandonAlert(true);

    const handleConfirmAbandon = async () => {
        if (isFinishing) return;
        setIsFinishing(true);
        setShowAbandonAlert(false);
        try {
            await abandonWorkout();
            router.replace('/(tabs)');
        } catch (error) {
            console.error("Failed to abandon workout:", error);
            setIsFinishing(false);
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
        <HStack space="sm">
            <AppButton
                title=""
                icon={XIcon}
                variant="outline"
                action="negative"
                onPress={handleAbandon}
                size="sm"
                className="w-10 h-10 p-0 rounded-full border-white/10"
            />
            <AppButton
                title="FINISH"
                action="positive"
                onPress={handleFinish}
                size="sm"
                className="px-4"
            />
        </HStack>
    );

    const focusedExercise = activeSession?.exercisesSnapshot?.find(e => e.exerciseId === focusedExerciseId);
    const focusedExistingSet = sessionSets.find(s => s.exerciseId === focusedExerciseId && s.setNumber === focusedSetNumber);

    const totalSetsRequired = activeSession?.exercisesSnapshot?.reduce((acc, ex) => acc + ex.sets, 0) || 0;
    const isWorkoutComplete = sessionSets.length >= totalSetsRequired && totalSetsRequired > 0;

    return (
        <Box className="flex-1 bg-surface-deep">
            <AppHeader
                title={activeSession!.dayNameSnapshot || 'Workout'}
                subTitle={activeSession!.programNameSnapshot || ''}
                rightElement={rightHeaderElement}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="xl" className="p-4 pb-48">
                    {/* Focus Card or Completion Card */}
                    {isWorkoutComplete ? (
                        <WorkoutCompleteCard onFinish={handleConfirmFinish} />
                    ) : (
                        focusedExercise && (
                            <ActiveSetFocus
                                exercise={focusedExercise}
                                setNumber={focusedSetNumber}
                                existingSet={focusedExistingSet}
                                onLog={handleLogSet}
                                onSkip={handleLogSet} // skip is same as log with skipped:true
                                isLogging={isLoggingSet}
                            />
                        )
                    )}

                    {/* Exercise List */}
                    <VStack space="md">
                        <Text size="xs" className="text-typography-500 font-bold uppercase tracking-widest ml-1">
                            Workout Details
                        </Text>
                        {activeSession!.exercisesSnapshot?.map((ex) => {
                            const isExpanded = expandedExercise === ex.programDayExerciseId;
                            const exerciseSets = sessionSets.filter(s => s.exerciseId === ex.exerciseId);
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

            {isActive && (
                <RestTimerOverlay
                    timeLeft={timeLeft}
                    onSkip={() => startTimer(0)}
                    onAddMore={() => startTimer(timeLeft + 30)}
                />
            )}

            <AppAlert
                isOpen={showFinishAlert}
                onClose={() => setShowFinishAlert(false)}
                title="Finish Workout"
                message="Are you sure you want to complete this session?"
                buttons={[
                    { text: "Cancel", style: "cancel" },
                    { text: "Finish", onPress: handleConfirmFinish }
                ]}
            />

            <AppAlert
                isOpen={showAbandonAlert}
                onClose={() => setShowAbandonAlert(false)}
                title="Abandon Workout"
                message="This will clear your current progress. Are you sure?"
                buttons={[
                    { text: "Keep Going", style: "cancel" },
                    { text: "Abandon", style: "destructive", onPress: handleConfirmAbandon }
                ]}
            />
        </Box>
    );
};

