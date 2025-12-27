import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { ChevronLeftIcon } from 'lucide-react-native';
import { cn } from '@/src/utils/cn';

interface AppHeaderProps {
    title: string;
    subTitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightElement?: React.ReactNode;
    className?: string;
    sticky?: boolean;
}

export const AppHeader = ({
    title,
    subTitle,
    showBack = true,
    onBack,
    rightElement,
    className,
    sticky = true,
}: AppHeaderProps) => {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <VStack
            className={cn(
                "pt-12 pb-4 px-4 bg-surface-deep border-b",
                sticky && "z-10",
                className
            )}
            style={[
                { borderColor: 'rgba(255, 255, 255, 0.05)' },
                sticky ? {
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3
                } : {}
            ]}
        >
            <HStack className="justify-between items-center min-h-[48px]">
                <HStack space="md" className="items-center flex-1">
                    {showBack && (
                        <Pressable onPress={handleBack} hitSlop={20} className="active:opacity-50">
                            <Icon as={ChevronLeftIcon} size="xl" className="text-typography-500 mr-1" />
                        </Pressable>
                    )}
                    <VStack className="flex-1">
                        <Heading size="md" className="text-white" numberOfLines={1}>
                            {title}
                        </Heading>
                        {subTitle && (
                            <Text className="text-xs text-primary-energy font-bold uppercase tracking-wider">
                                {subTitle}
                            </Text>
                        )}
                    </VStack>
                </HStack>

                {rightElement && (
                    <HStack space="sm" className="items-center ml-2">
                        {rightElement}
                    </HStack>
                )}
            </HStack>
        </VStack>
    );
};
