import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { EditIcon, TrashIcon, ListIcon, PlusIcon } from 'lucide-react-native';
import { AppCard } from './AppCard';
import { AppButton } from './AppButton';
import { ProgramDay, ProgramDayExercise } from '@/src/types/domain';

type ProgramDayExerciseWithExercise = ProgramDayExercise & { exerciseName?: string };

type ProgramDayCardProps = {
    day: ProgramDay;
    exercises?: ProgramDayExerciseWithExercise[];
    onEdit?: () => void;
    onDelete?: () => void;
    onAddExercise?: () => void;
};

export const ProgramDayCard = ({
    day,
    exercises = [],
    onEdit,
    onDelete,
    onAddExercise
}: ProgramDayCardProps) => {
    return (
        <AppCard className="mb-4">
            <VStack space="md">
                <HStack className="justify-between items-center">
                    <HStack space="sm" className="items-center">
                        <Box className="p-2 bg-primary-energy/10 rounded-lg">
                            <Icon as={ListIcon} size="sm" className="text-primary-energy" />
                        </Box>
                        <Heading size="sm" className="text-typography-900">{day.name}</Heading>
                    </HStack>
                    <HStack space="xs">
                        <AppButton
                            title=""
                            icon={EditIcon}
                            variant="outline"
                            size="xs"
                            onPress={onEdit}
                            className="w-10 h-10 p-0"
                            textClassName="text-primary-energy"
                        />
                        <AppButton
                            title=""
                            icon={TrashIcon}
                            variant="outline"
                            action="negative"
                            size="xs"
                            onPress={onDelete}
                            className="w-10 h-10 p-0"
                            textClassName="text-error-critical"
                        />
                    </HStack>
                </HStack>

                <Divider />

                <VStack space="sm">
                    {exercises.length === 0 ? (
                        <Text size="xs" className="text-typography-400 italic py-2">No exercises added yet.</Text>
                    ) : (
                        exercises.map((ex, idx) => (
                            <HStack key={ex.id || idx} className="justify-between items-center py-1">
                                <HStack space="xs" className="items-center flex-1">
                                    <Text size="sm" className="text-typography-700 font-medium">{idx + 1}.</Text>
                                    <Text size="sm" className="text-typography-900">{ex.exerciseName || 'Exercise'}</Text>
                                </HStack>
                                <Text size="xs" className="text-typography-500 font-bold">{ex.sets} sets</Text>
                            </HStack>
                        ))
                    )}
                </VStack>

                <AppButton
                    title="Add Exercise"
                    icon={PlusIcon}
                    variant="outline"
                    size="sm"
                    onPress={onAddExercise}
                    className="mt-2 border-dashed border-primary-energy/30"
                    textClassName="text-primary-energy font-medium"
                />
            </VStack>
        </AppCard>
    );
};

const Divider = () => <Box className="h-[1px] bg-outline-dark/5 my-1" />;
