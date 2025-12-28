import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import {
    DumbbellIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from 'lucide-react-native';
import { AppCard } from './AppCard';
import { ExerciseSnapshotItem, ResistanceType, TrackingType } from '@/src/types/domain';

interface ActiveExerciseCardProps {
    exercise: ExerciseSnapshotItem;
    completedSets: number;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export const ActiveExerciseCard = ({
    exercise,
    completedSets,
    isExpanded,
    onToggle,
    children
}: ActiveExerciseCardProps) => {
    return (
        <AppCard className="p-0 overflow-hidden mb-4">
            <Pressable
                onPress={onToggle}
                className="p-4 active:bg-white/5"
            >
                <HStack className="justify-between items-center">
                    <HStack space="md" className="items-center flex-1">
                        <Box
                            className="w-12 h-12 rounded-xl items-center justify-center bg-primary-energy/10"
                        >
                            <Icon as={DumbbellIcon} size="md" className="text-primary-energy" />
                        </Box>
                        <VStack className="flex-1">
                            <Heading size="sm" className="text-white">
                                {exercise.exerciseName}
                            </Heading>
                            <Text size="xs" className="text-typography-500 font-medium">
                                {completedSets} / {exercise.sets} sets • {exercise.resistanceType === ResistanceType.WEIGHT ? (exercise.suggestedWeight ? `${exercise.suggestedWeight}kg` : '0kg') : exercise.suggestedDifficulty || 'No diff'} • {exercise.trackingType === TrackingType.REPS ? `${exercise.targetReps} reps` : `${exercise.targetTimeSeconds}s`}
                            </Text>
                        </VStack>
                    </HStack>
                    <Icon
                        as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                        size="sm"
                        className="text-typography-400"
                    />
                </HStack>
            </Pressable>

            {isExpanded && (
                <VStack
                    className="px-4 pb-4 border-t pt-4 border-outline-dark/5"
                    space="xs"
                >
                    {children}
                </VStack>
            )}
        </AppCard>
    );
};
