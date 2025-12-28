import React, { useState, useEffect } from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { CheckIcon, XIcon } from 'lucide-react-native';
import { ExerciseSnapshotItem, WorkoutSet, TrackingType, ResistanceType } from '@/src/types/domain';
import { useToast, Toast, ToastTitle } from '@/components/ui/toast';

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
    const toast = useToast();

    useEffect(() => {
        // Reset state when the underlying set changes
        setWeight(set.weight?.toString() || '');
        setReps(set.reps?.toString() || '');
        setTime(set.timeSeconds?.toString() || '');
        setDifficulty(set.difficulty || '');
    }, [set]);

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

    const isReps = exercise.trackingType === TrackingType.REPS;
    const isWeight = exercise.resistanceType === ResistanceType.WEIGHT;

    const handleBlur = async () => {
        // Validation: ensure we have valid numbers (for numeric fields)
        const currentWeight = parseFloat(weight || '0');
        const currentReps = parseInt(reps || '0');
        const currentTime = parseInt(time || '0');

        if (isWeight && isNaN(currentWeight)) return;
        if (isReps && isNaN(currentReps)) return;
        if (!isReps && isNaN(currentTime)) return;

        // Check if values are different from initial props
        const hasChanges =
            (isWeight && currentWeight !== (set.weight || 0)) ||
            (isReps && currentReps !== (set.reps || 0)) ||
            (!isReps && currentTime !== (set.timeSeconds || 0)) ||
            (!isWeight && difficulty !== (set.difficulty || ''));

        if (!hasChanges) return;

        await handleSave();
    };

    return (
        <HStack
            space="md"
            className="items-center py-3 px-3 rounded-xl mb-1 border bg-background-dark/20 border-transparent"
        >
            <Box className="w-8 items-center">
                <Text size="sm" className="font-bold text-typography-500">{setNumber}</Text>
            </Box>

            {isWeight ? (
                <Box className="flex-[1.2]">
                    <Input size="sm" variant="underlined" className="border-0 bg-white/5 rounded px-2">
                        <InputField
                            placeholder="kg"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={(t) => setWeight(t)}
                            onBlur={handleBlur}
                            className="text-white font-medium text-center"
                        />
                    </Input>
                </Box>
            ) : (
                <Box className="flex-[1.2]">
                    <Input size="sm" variant="underlined" className="border-0 bg-white/5 rounded px-2">
                        <InputField
                            placeholder="RPE/Diff"
                            value={difficulty}
                            onChangeText={(t) => setDifficulty(t)}
                            onBlur={handleBlur}
                            className="text-white font-medium text-center"
                        />
                    </Input>
                </Box>
            )}

            <Box className="flex-1">
                <Input size="sm" variant="underlined" className="border-0 bg-white/5 rounded px-2">
                    <InputField
                        placeholder={isReps ? "reps" : "secs"}
                        keyboardType="numeric"
                        value={isReps ? reps : time}
                        onChangeText={(t) => isReps ? setReps(t) : setTime(t)}
                        onBlur={handleBlur}
                        className="text-white font-medium text-center"
                    />
                </Input>
            </Box>
        </HStack>
    );
};
