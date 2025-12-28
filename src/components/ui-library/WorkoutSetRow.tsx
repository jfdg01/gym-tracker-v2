import React, { memo } from 'react';
import { Vibration, TouchableOpacity } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CheckIcon, SkipForwardIcon } from 'lucide-react-native';
import { ExerciseSnapshotItem, WorkoutSet, TrackingType, ResistanceType } from '@/src/types/domain';
import { cn } from '@/src/utils/cn';
import { AppNumericInput } from './AppNumericInput';


interface WorkoutSetRowProps {
    setNumber: number;
    exercise: ExerciseSnapshotItem;
    existingSet?: WorkoutSet;
    isFocused: boolean;
    onFocus: (setNumber: number) => void;
}

export const WorkoutSetRow = memo(({
    setNumber,
    exercise,
    existingSet,
    isFocused,
    onFocus
}: WorkoutSetRowProps) => {
    const isWeight = exercise.resistanceType === ResistanceType.WEIGHT;
    const isReps = exercise.trackingType === TrackingType.REPS;

    const isLogged = !!existingSet && !existingSet.skipped;
    const isSkipped = existingSet?.skipped;

    return (
        <TouchableOpacity
            onPress={() => onFocus(setNumber)}
            activeOpacity={0.7}
            className={cn(
                "flex-row items-center h-14 px-4 rounded-2xl mb-2 border",
                isFocused
                    ? "border-primary-energy/30"
                    : isLogged
                        ? "border-success-growth/20"
                        : "border-white/5"
            )}
            style={{
                backgroundColor: isFocused
                    ? 'rgba(79, 70, 229, 0.1)'
                    : isLogged
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)'
            }}
        >
            {/* Status Indicator / Set Number */}
            <Box
                className={cn(
                    "w-8 h-8 rounded-full items-center justify-center mr-4",
                    isLogged ? "bg-success-growth" :
                        isFocused ? "bg-primary-energy" : ""
                )}
                style={(!isLogged && !isFocused) ? { backgroundColor: isSkipped ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)' } : {}}
            >
                {isLogged ? (
                    <Icon as={CheckIcon} size="xs" className="text-white" />
                ) : (
                    <Text size="xs" className={cn(
                        "font-black",
                        isFocused ? "text-background-dark" : "text-typography-500"
                    )}>
                        {setNumber}
                    </Text>
                )}
            </Box>

            {/* Values Display */}
            <HStack space="md" className="flex-1">
                {/* Weight/Difficulty Pill */}
                <Box
                    className="flex-1 h-10 rounded-xl border flex-row items-center justify-center px-2"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <Text size="sm" className="font-bold text-white">
                        {isWeight
                            ? (+(existingSet?.weight ?? exercise.suggestedWeight ?? 0).toFixed(2))
                            : (existingSet?.difficulty || exercise.suggestedDifficulty || exercise.difficultyLevels?.[0] || '0')}

                    </Text>
                    <Text size="2xs" className="text-typography-500 font-bold uppercase ml-1">
                        {isWeight ? 'kg' : (exercise.difficultyLevels?.length ? '' : 'rpe')}
                    </Text>
                </Box>

                {/* Reps/Time Pill */}
                <Box
                    className="flex-1 h-10 rounded-xl border flex-row items-center justify-center px-2"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <Text size="sm" className="font-bold text-white">
                        {existingSet?.reps || existingSet?.timeSeconds || exercise.targetReps || exercise.targetTimeSeconds || '0'}
                    </Text>
                    <Text size="2xs" className="text-typography-500 font-bold uppercase ml-1">
                        {isReps ? 'reps' : 's'}
                    </Text>
                </Box>
            </HStack>

            {/* Selection Indicator (Right Side) */}
            {isFocused && (
                <Box className="ml-2 w-1.5 h-6 bg-primary-energy rounded-full" />
            )}
        </TouchableOpacity>
    );
}, (prev: WorkoutSetRowProps, next: WorkoutSetRowProps) => (
    prev.existingSet?.id === next.existingSet?.id &&
    prev.existingSet?.skipped === next.existingSet?.skipped &&
    prev.setNumber === next.setNumber &&
    prev.isFocused === next.isFocused &&
    prev.exercise.exerciseId === next.exercise.exerciseId
));

