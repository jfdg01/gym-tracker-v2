import React, { useState, useEffect, useCallback, memo } from 'react';
import { Vibration } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { CheckIcon, SkipForwardIcon, DumbbellIcon, PlusIcon, XIcon } from 'lucide-react-native';
import { Motion } from '@legendapp/motion';
import { AppNumericInput } from './AppNumericInput';
import { AppSelect } from './AppSelect';
import { AppCard } from './AppCard';
import { ExerciseSnapshotItem, WorkoutSet, TrackingType, ResistanceType } from '@/src/types/domain';
import { cn } from '@/src/utils/cn';

interface ActiveSetFocusProps {
    exercise: ExerciseSnapshotItem;
    setNumber: number;
    existingSet?: WorkoutSet;
    previousSet?: WorkoutSet; // The last recorded set for this exercise
    onLog: (data: Partial<WorkoutSet>) => void;
    onSkip: (data: Partial<WorkoutSet>) => void;
    isLogging?: boolean;
    timerActive?: boolean;
    timeLeft?: number;
    onSkipTimer?: () => void;
    onAddMoreTimer?: () => void;
}

export const ActiveSetFocus = memo(({
    exercise,
    setNumber,
    existingSet,
    previousSet,
    onLog,
    onSkip,
    isLogging = false,
    timerActive = false,
    timeLeft = 0,
    onSkipTimer,
    onAddMoreTimer
}: ActiveSetFocusProps) => {
    // Local state for interactive logging
    const [weight, setWeight] = useState(
        (existingSet?.weight ? (+existingSet.weight.toFixed(2)).toString() : undefined) ||
        (previousSet?.weight ? (+previousSet.weight.toFixed(2)).toString() : undefined) ||
        (exercise.suggestedWeight ? (+exercise.suggestedWeight.toFixed(2)).toString() : undefined) ||
        ''
    );
    const [reps, setReps] = useState(
        existingSet?.reps?.toString() ||
        previousSet?.reps?.toString() ||
        exercise.targetReps?.toString() ||
        ''
    );
    const [time, setTime] = useState(
        existingSet?.timeSeconds?.toString() ||
        previousSet?.timeSeconds?.toString() ||
        exercise.targetTimeSeconds?.toString() ||
        ''
    );
    const [difficulty, setDifficulty] = useState(
        existingSet?.difficulty ||
        previousSet?.difficulty ||
        exercise.suggestedDifficulty ||
        (exercise.difficultyLevels && exercise.difficultyLevels.length > 0 ? exercise.difficultyLevels[0] : '')
    );

    // Sync state if exercise or setNumber changes (selection from list)
    useEffect(() => {
        setWeight(
            (existingSet?.weight ? (+existingSet.weight.toFixed(2)).toString() : undefined) ||
            (previousSet?.weight ? (+previousSet.weight.toFixed(2)).toString() : undefined) ||
            (exercise.suggestedWeight ? (+exercise.suggestedWeight.toFixed(2)).toString() : undefined) ||
            ''
        );
        setReps(
            existingSet?.reps?.toString() ||
            previousSet?.reps?.toString() ||
            exercise.targetReps?.toString() ||
            ''
        );
        setTime(
            existingSet?.timeSeconds?.toString() ||
            previousSet?.timeSeconds?.toString() ||
            exercise.targetTimeSeconds?.toString() ||
            ''
        );
        setDifficulty(
            existingSet?.difficulty ||
            previousSet?.difficulty ||
            exercise.suggestedDifficulty ||
            (exercise.difficultyLevels && exercise.difficultyLevels.length > 0 ? exercise.difficultyLevels[0] : '')
        );
    }, [exercise.exerciseId, setNumber, existingSet?.id, previousSet?.id]);

    const handleLog = () => {
        onLog({
            setNumber,
            exerciseId: exercise.exerciseId,
            weight: exercise.resistanceType === ResistanceType.WEIGHT ? (parseFloat(weight) || 0) : null,
            reps: exercise.trackingType === TrackingType.REPS ? (parseInt(reps) || 0) : null,
            timeSeconds: exercise.trackingType === TrackingType.TIME ? (parseInt(time) || 0) : null,
            difficulty: exercise.resistanceType === ResistanceType.DIFFICULTY ? difficulty : null,
            skipped: false
        });
        Vibration.vibrate(15);
    };

    const handleSkip = () => {
        onSkip({
            setNumber,
            exerciseId: exercise.exerciseId,
            skipped: true
        });
        Vibration.vibrate(10);
    };

    const isReps = exercise.trackingType === TrackingType.REPS;
    const isWeight = exercise.resistanceType === ResistanceType.WEIGHT;

    return (
        <AppCard className="bg-surface-deep border-primary-energy/20 border-2 overflow-hidden">
            <VStack space="xl" className="p-6">
                {timerActive ? (
                    <VStack space="xl" className="items-center py-4">
                        <VStack space="xs" className="items-center">
                            <Text className="text-typography-500 font-bold uppercase tracking-[0.2em] size-xs">
                                Resting
                            </Text>
                            <Box className="w-1 h-1 rounded-full bg-accent-warning" />
                        </VStack>

                        <Box className="w-32 h-32 rounded-full border-8 border-accent-warning/20 items-center justify-center relative">
                            <Motion.View
                                initial={{ scale: 0.9, opacity: 0.1 }}
                                animate={{ scale: 1.1, opacity: 0.3 }}
                                transition={{
                                    type: 'timing',
                                    duration: 1500,
                                    loop: true,
                                }}
                                className="absolute inset-0 rounded-full border-2 border-accent-warning"
                            />
                            <VStack className="items-center">
                                <Text className="text-accent-warning font-bold text-4xl font-space-mono tracking-tighter">
                                    {timeLeft}s
                                </Text>
                            </VStack>
                        </Box>

                        <HStack space="md" className="w-full pt-2">
                            <Button
                                size="xl"
                                variant="outline"
                                action="secondary"
                                className="flex-1 h-14 rounded-2xl border-white/10"
                                onPress={onSkipTimer}
                            >
                                <ButtonIcon as={XIcon} className="text-typography-400 mr-2" />
                                <ButtonText className="text-typography-400 font-bold">SKIP</ButtonText>
                            </Button>
                            <Button
                                size="xl"
                                action="primary"
                                className="flex-1 h-14 rounded-2xl bg-primary-energy"
                                onPress={onAddMoreTimer}
                            >
                                <ButtonIcon as={PlusIcon} className="text-white mr-2" />
                                <ButtonText className="text-white font-black text-lg">+30S</ButtonText>
                            </Button>
                        </HStack>
                    </VStack>
                ) : (
                    <>
                        {/* Header */}
                        <VStack space="xs" className="items-center">
                            <HStack space="sm" className="items-center">
                                <Box
                                    className="w-8 h-8 rounded-lg items-center justify-center"
                                    style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                                >
                                    <Icon as={DumbbellIcon} size="xs" className="text-primary-energy" />
                                </Box>
                                <Heading size="md" className="text-white text-center uppercase tracking-tight font-black">
                                    {exercise.exerciseName}
                                </Heading>
                            </HStack>
                            <Text size="sm" className="text-primary-energy font-bold uppercase tracking-widest">
                                Set {setNumber} of {exercise.sets}
                            </Text>
                        </VStack>

                        {/* Target Display (Subtle) */}
                        <Box
                            className="rounded-2xl p-3 border items-center"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
                        >
                            <Text size="xs" className="text-typography-500 font-bold uppercase mb-1">Target</Text>
                            <Text size="md" className="text-white font-bold">
                                {exercise.targetReps || exercise.targetTimeSeconds} {isReps ? 'reps' : 's'}
                                {exercise.suggestedWeight ? ` @ ${+(exercise.suggestedWeight || 0).toFixed(2)}kg` : ''}
                                {exercise.suggestedDifficulty ? ` @ ${exercise.suggestedDifficulty}` : ''}
                            </Text>
                        </Box>

                        {/* Main Inputs */}
                        <HStack space="md" className="w-full">
                            <Box className="flex-1">
                                <Text size="2xs" className="text-typography-500 font-black uppercase mb-2 ml-1">
                                    {isWeight ? 'Weight (kg)' : 'Level'}
                                </Text>
                                {exercise.difficultyLevels && exercise.difficultyLevels.length > 0 && !isWeight ? (
                                    <AppSelect
                                        value={difficulty}
                                        onValueChange={setDifficulty}
                                        options={exercise.difficultyLevels.map(l => ({ label: l, value: l }))}
                                        placeholder="Select Difficulty"
                                        className="h-14"
                                    />
                                ) : (
                                    <AppNumericInput
                                        value={isWeight ? weight : difficulty}
                                        onChange={isWeight ? setWeight : setDifficulty}
                                        unit={isWeight ? 'kg' : 'RPE'}
                                        hideUnitDisplay={true}
                                        label={isWeight ? 'Weight' : 'Difficulty'}
                                        step={isWeight ? 2.5 : 1}
                                        max={isWeight ? 1000 : 10}
                                        quickValues={isWeight ? [20, 40, 60, 80, 100, 120, 140, 160] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                                        className="h-14"
                                    />
                                )}
                            </Box>
                            <Box className="flex-1">
                                <Text size="2xs" className="text-typography-500 font-black uppercase mb-2 ml-1">
                                    {isReps ? 'Reps' : 'Time (s)'}
                                </Text>
                                <AppNumericInput
                                    value={isReps ? reps : time}
                                    onChange={isReps ? setReps : setTime}
                                    unit={isReps ? undefined : 's'}
                                    hideUnitDisplay={!isReps}
                                    label={isReps ? 'Reps' : 'Time'}
                                    max={isReps ? 300 : 3600}
                                    className="h-14"
                                />
                            </Box>
                        </HStack>

                        {/* Actions */}
                        <HStack space="md" className="w-full pt-2">
                            <Button
                                size="xl"
                                variant="outline"
                                action="secondary"
                                className={cn("flex-1 h-14 rounded-2xl border-white/10", isLogging && "opacity-50")}
                                onPress={handleSkip}
                                disabled={isLogging}
                            >
                                <ButtonIcon as={SkipForwardIcon} className="text-typography-400 mr-2" />
                                <ButtonText className="text-typography-400 font-bold">SKIP</ButtonText>
                            </Button>
                            <Button
                                size="xl"
                                action="positive"
                                className={cn("flex-[1.5] h-14 rounded-2xl bg-success-growth", isLogging && "opacity-80")}
                                style={{ shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
                                onPress={handleLog}
                                disabled={isLogging}
                            >
                                {isLogging ? (
                                    <ButtonText className="text-white font-black text-lg">LOGGING...</ButtonText>
                                ) : (
                                    <>
                                        <ButtonIcon as={CheckIcon} className="text-white mr-2" />
                                        <ButtonText className="text-white font-black text-lg">LOG SET</ButtonText>
                                    </>
                                )}
                            </Button>
                        </HStack>
                    </>
                )}
            </VStack>
        </AppCard >
    );
});
