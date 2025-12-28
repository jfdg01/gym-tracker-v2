import React, { useState, useEffect } from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { CheckIcon, XIcon } from 'lucide-react-native';
import { ExerciseSnapshotItem, WorkoutSet, TrackingType, ResistanceType } from '@/src/types/domain';
import { useToast, Toast, ToastTitle } from '@/components/ui/toast';
import { AppNumericInput } from './AppNumericInput';
import { useDebounce } from '@/src/hooks/useDebounce';

interface EditWorkoutSetRowProps {
    setNumber: number;
    exercise: ExerciseSnapshotItem;
    set: WorkoutSet;
    onUpdate: (data: Partial<WorkoutSet>) => Promise<void>;
}

export const EditWorkoutSetRow = ({
    setNumber,
    exercise,
    set,
    onUpdate
}: EditWorkoutSetRowProps) => {
    const [weight, setWeight] = useState(set.weight?.toString() || '');
    const [reps, setReps] = useState(set.reps?.toString() || '');
    const [time, setTime] = useState(set.timeSeconds?.toString() || '');
    const [difficulty, setDifficulty] = useState(set.difficulty || '');
    const [saving, setSaving] = useState(false);
    const isReps = exercise.trackingType === TrackingType.REPS;
    const isWeight = exercise.resistanceType === ResistanceType.WEIGHT;
    const toast = useToast();

    useEffect(() => {
        // Reset state when the underlying set changes
        setWeight(set.weight?.toString() || '');
        setReps(set.reps?.toString() || '');
        setTime(set.timeSeconds?.toString() || '');
        setDifficulty(set.difficulty || '');
    }, [set]);

    // Auto-save when values change with a small debounce to avoid spamming
    const debouncedWeight = useDebounce(weight, 500);
    const debouncedReps = useDebounce(reps, 500);
    const debouncedTime = useDebounce(time, 500);
    const debouncedDifficulty = useDebounce(difficulty, 500);

    useEffect(() => {
        const currentWeight = parseFloat(debouncedWeight || '0');
        const currentReps = parseInt(debouncedReps || '0');
        const currentTime = parseInt(debouncedTime || '0');

        const hasChanges =
            (isWeight && currentWeight !== (set.weight || 0)) ||
            (isReps && currentReps !== (set.reps || 0)) ||
            (!isReps && currentTime !== (set.timeSeconds || 0)) ||
            (!isWeight && debouncedDifficulty !== (set.difficulty || ''));

        if (hasChanges) {
            handleSave();
        }
    }, [debouncedWeight, debouncedReps, debouncedTime, debouncedDifficulty]);


    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdate({
                id: set.id,
                workoutSessionId: set.workoutSessionId,
                exerciseId: set.exerciseId,
                setNumber: setNumber,
                weight: exercise.resistanceType === ResistanceType.WEIGHT ? (parseFloat(weight) || 0) : null,
                reps: exercise.trackingType === TrackingType.REPS ? (parseInt(reps) || 0) : null,
                timeSeconds: exercise.trackingType === TrackingType.TIME ? (parseInt(time) || 0) : null,
                difficulty: exercise.resistanceType === ResistanceType.DIFFICULTY ? difficulty : null,
                skipped: false
            });

            toast.show({
                id: `save-set-${set.id}`,
                placement: 'top',
                render: ({ id }) => {
                    const toastId = "toast-" + id;
                    return (
                        <Toast nativeID={toastId} action="success" variant="outline">
                            <HStack space="md">
                                <Icon as={CheckIcon} className="text-success-growth" />
                                <ToastTitle>Saved</ToastTitle>
                            </HStack>
                        </Toast>
                    )
                },
            });
        } catch (error) {
            console.error(error);
            toast.show({
                id: `error-set-${set.id}`,
                placement: 'top',
                render: ({ id }) => {
                    const toastId = "toast-" + id;
                    return (
                        <Toast nativeID={toastId} action="error" variant="outline">
                            <HStack space="md">
                                <Icon as={XIcon} className="text-error-critical" />
                                <ToastTitle>Error saving set</ToastTitle>
                            </HStack>
                        </Toast>
                    )
                },
            });
        } finally {
            setSaving(false);
        }
    };





    return (
        <HStack
            space="md"
            className="items-center py-3 px-3 rounded-xl mb-1 border bg-background-dark/20 border-transparent"
        >
            <Box className="w-8 items-center">
                <Text size="sm" className="font-bold text-typography-500">{setNumber}</Text>
            </Box>

            <Box className="flex-[2]">
                <AppNumericInput
                    value={isWeight ? weight : difficulty}
                    onChange={isWeight ? setWeight : setDifficulty}
                    unit={isWeight ? 'kg' : 'RPE'}
                    label={isWeight ? 'Weight' : 'Difficulty'}
                    placeholder={isWeight ? (exercise.suggestedWeight?.toString() || "0") : "0"}
                    step={isWeight ? 2.5 : 1}
                    max={isWeight ? 1000 : 10}
                    quickValues={isWeight ? [20, 40, 60, 80, 100, 120, 140, 160] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                />
            </Box>


            <Box className="flex-[2]">
                <AppNumericInput
                    value={isReps ? reps : time}
                    onChange={isReps ? setReps : setTime}
                    unit={isReps ? 'reps' : 's'}
                    label={isReps ? 'Reps' : 'Time'}
                    max={isReps ? 300 : 3600}
                    placeholder={isReps ? (exercise.targetReps?.toString() || "0") : (exercise.targetTimeSeconds?.toString() || "0")}
                />
            </Box>

        </HStack>
    );
};
