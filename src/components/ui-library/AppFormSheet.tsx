import React from 'react';
import {
    Actionsheet,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetBackdrop,
    ActionsheetScrollView,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { X } from 'lucide-react-native';

interface AppFormSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subTitle?: string;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
}

export const AppFormSheet = ({ isOpen, onClose, title, subTitle, headerRight, children }: AppFormSheetProps) => {
    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent className="max-h-[85%] bg-surface-deep border-t border-outline-dark/10">
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator className="bg-typography-400" />
                </ActionsheetDragIndicatorWrapper>

                <ActionsheetScrollView className="w-full">
                    <VStack space="md" className="w-full p-4 mb-8">
                        <HStack className="w-full justify-between items-center mb-2">
                            <VStack className="flex-1">
                                <Text className="text-xl font-bold text-white">
                                    {title}
                                </Text>
                                {subTitle && (
                                    <Text className="text-sm text-primary-energy font-medium uppercase tracking-wider">
                                        {subTitle}
                                    </Text>
                                )}
                            </VStack>
                            <HStack space="md" className="items-center">
                                {headerRight}
                                <Button size="sm" variant="link" onPress={onClose} className="p-0 ml-2">
                                    <Icon as={X} size="xl" className="text-typography-500" />
                                </Button>
                            </HStack>
                        </HStack>

                        {children}
                    </VStack>
                </ActionsheetScrollView>
            </ActionsheetContent>
        </Actionsheet>
    );
};
