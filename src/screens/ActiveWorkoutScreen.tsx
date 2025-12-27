import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
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

export const ActiveWorkoutScreen = () => {
    const router = useRouter();
    const { activeSession, sessionSets, logSet, completeWorkout, abandonWorkout, loading } = useWorkout();
    const { timeLeft, isActive, startTimer } = useRestTimer();
    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
    const [showFinishAlert, setShowFinishAlert] = useState(false);
    const [showAbandonAlert, setShowAbandonAlert] = useState(false);

    const handleLogSet = async (data: Partial<WorkoutSet>) => {
        await logSet(data as any);
        if (!data.skipped) {
            startTimer(90); // Default rest time
        }
    };

    const handleFinish = () => {
        setShowFinishAlert(true);
    };

    const handleConfirmFinish = async () => {
        setShowFinishAlert(false);
        await completeWorkout();
        router.replace('/(tabs)/history');
    };

    const handleAbandon = () => {
        setShowAbandonAlert(true);
    };

    const handleConfirmAbandon = async () => {
        setShowAbandonAlert(false);
        await abandonWorkout();
        router.replace('/(tabs)');
    };

    if (loading) return (
        <Box className="flex-1 bg-surface-deep justify-center items-center">
            <Text className="text-typography-500">Loading session...</Text>
        </Box>
    );

    if (!activeSession) return (
        <Box className="flex-1 bg-surface-deep justify-center items-center p-6">
            <VStack space="md" className="items-center">
                <Text className="text-typography-400 text-center">No active session found.</Text>
                <AppButton title="Go Home" onPress={() => router.replace('/(tabs)')} action="primary" />
            </VStack>
        </Box>
    );

    const rightHeaderElement = (
        <>
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
        </>
    );

    return (
        <Box className="flex-1 bg-surface-deep">
            <AppHeader
                title={activeSession.dayNameSnapshot || 'Workout'}
                subTitle={activeSession.programNameSnapshot || ''}
                rightElement={rightHeaderElement}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="lg" className="p-4 pb-48">
                    {activeSession.exercisesSnapshot?.map((ex, idx) => {
                        const isExpanded = expandedExercise === ex.programDayExerciseId || (expandedExercise === null && idx === 0);
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
                                        onLog={handleLogSet}
                                    />
                                ))}
                            </ActiveExerciseCard>
                        );
                    })}
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
