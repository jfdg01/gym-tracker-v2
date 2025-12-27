import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Badge, BadgeText } from '@/components/ui/badge';
import { ChevronRightIcon, DumbbellIcon } from 'lucide-react-native';
import { AppCard } from './AppCard';
import { Exercise } from '@/src/types/domain';

type ExerciseCardProps = {
    exercise: Exercise;
    onPress?: () => void;
    showChevron?: boolean;
};

export const ExerciseCard = ({
    exercise,
    onPress,
    showChevron = true
}: ExerciseCardProps) => {
    return (
        <AppCard className="mb-3 overflow-hidden">
            <Box className="p-4">
                <HStack space="md" className="items-center justify-between">
                    <HStack space="md" className="flex-1 items-center">
                        <Box className="p-2 bg-primary-energy/10 rounded-lg">
                            <Icon as={DumbbellIcon} size="sm" className="text-primary-energy" />
                        </Box>
                        <VStack className="flex-1">
                            <Heading size="sm" className="text-typography-900">{exercise.name}</Heading>
                            <HStack space="xs" className="mt-1">
                                <Badge size="sm" variant="outline" action="muted" className="border-0 bg-background-dark/5 px-2">
                                    <BadgeText className="text-2xs text-typography-500">{exercise.category || 'No Category'}</BadgeText>
                                </Badge>
                                <Badge size="sm" variant="outline" action="muted" className="border-0 bg-background-dark/5 px-2">
                                    <BadgeText className="text-2xs text-typography-500">{exercise.defaultTrackingType}</BadgeText>
                                </Badge>
                            </HStack>
                        </VStack>
                    </HStack>

                    {showChevron && (
                        <Icon as={ChevronRightIcon} size="sm" className="text-typography-300" />
                    )}
                </HStack>
            </Box>
        </AppCard>
    );
};
