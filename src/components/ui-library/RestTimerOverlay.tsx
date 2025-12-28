import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { XIcon } from 'lucide-react-native';
import { AppButton } from './AppButton';

interface RestTimerOverlayProps {
    timeLeft: number;
    onSkip: () => void;
    onAddMore: () => void;
}

export const RestTimerOverlay = ({ timeLeft, onSkip, onAddMore }: RestTimerOverlayProps) => {
    return (
        <Box
            className="absolute inset-0 justify-center items-center z-50 px-6"
            style={{ backgroundColor: 'rgba(12, 12, 12, 0.95)' }}
        >
            <VStack space="2xl" className="items-center w-full">
                <VStack space="xs" className="items-center mb-4">
                    <Text className="text-typography-500 font-bold uppercase tracking-[0.2em] text-sm">
                        Resting
                    </Text>
                    <Box className="w-1 h-1 rounded-full bg-accent-warning" />
                </VStack>

                <Box className="w-64 h-64 rounded-full border-[12px] border-accent-warning/20 items-center justify-center relative">
                    {/* TODO: Add inner pulse circle animation. */}
                    <Box
                        className="absolute inset-2 rounded-full border-4 border-accent-warning opacity-20"
                    />
                    <VStack className="items-center">
                        <Text className="text-accent-warning font-bold text-7xl font-space-mono tracking-tighter">
                            {timeLeft}s
                        </Text>
                    </VStack>
                </Box>

                <HStack space="lg" className="mt-8">
                    <AppButton
                        title="SKIP"
                        variant="outline"
                        icon={XIcon}
                        onPress={onSkip}
                        className="rounded-full px-10 h-16 border-white/10"
                        textClassName="text-white font-bold"
                    />
                    <AppButton
                        title="+30s"
                        action="primary"
                        onPress={onAddMore}
                        className="rounded-full px-10 h-16 shadow-2xl shadow-primary-energy/40"
                        textClassName="text-white font-bold"
                    />
                </HStack>
            </VStack>
        </Box>
    );
};
