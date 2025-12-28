import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { TrophyIcon, SparklesIcon } from 'lucide-react-native';
import { AppCard } from './AppCard';
import { AppButton } from './AppButton';

interface WorkoutCompleteCardProps {
    onFinish: () => void;
}

export const WorkoutCompleteCard = ({ onFinish }: WorkoutCompleteCardProps) => {
    return (
        <AppCard className="bg-surface-deep border-success-growth/20 border-2 overflow-hidden">
            <VStack space="xl" className="p-8 items-center">
                <Box
                    className="w-20 h-20 rounded-full items-center justify-center bg-success-growth/10 mb-2"
                >
                    <Icon as={TrophyIcon} size="xl" className="text-success-growth" />
                </Box>

                <VStack space="xs" className="items-center">
                    <Heading size="xl" className="text-white text-center font-black uppercase tracking-tight">
                        Workout Complete!
                    </Heading>
                    <Text className="text-typography-400 text-center text-lg">
                        You've crushed every single set. Ready to see your gains?
                    </Text>
                </VStack>

                <AppButton
                    title="FINISH SESSION"
                    action="positive"
                    size="lg"
                    className="w-full h-16 rounded-2xl"
                    onPress={onFinish}
                    icon={SparklesIcon}
                />
            </VStack>
        </AppCard>
    );
};
