import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Pressable } from 'react-native';
import { CalendarIcon, ChevronRightIcon, LayoutIcon } from 'lucide-react-native';
import { AppCard } from './AppCard';
import { Program, ProgramDay } from '@/src/types/domain';

type ProgramCardProps = {
    program: Program;
    suggestedDay?: ProgramDay | null;
    onPress?: () => void;
};

export const ProgramCard = ({
    program,
    suggestedDay,
    onPress
}: ProgramCardProps) => {
    return (
        <AppCard className="mb-4 p-0 overflow-hidden">
            <Pressable
                onPress={onPress}
                android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}
            >
                <HStack className="p-5 items-center justify-between">
                    <HStack space="md" className="flex-1 items-center">
                        <Box
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                        >
                            <Icon as={LayoutIcon} size="md" className="text-primary-energy" />
                        </Box>
                        <VStack space="xs" className="flex-1">
                            <Heading size="md" className="text-typography-950">{program.name}</Heading>
                            {suggestedDay ? (
                                <HStack space="xs" className="items-center">
                                    <Icon as={CalendarIcon} size="xs" className="text-primary-energy" />
                                    <Text className="text-primary-energy text-sm font-semibold">
                                        Next: {suggestedDay.name}
                                    </Text>
                                </HStack>
                            ) : (
                                <Text className="text-typography-500 text-xs italic">No days configured</Text>
                            )}
                        </VStack>
                    </HStack>
                    <Box
                        className="rounded-full p-2"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    >
                        <Icon as={ChevronRightIcon} size="sm" className="text-typography-400" />
                    </Box>
                </HStack>
            </Pressable>
        </AppCard>
    );
};
