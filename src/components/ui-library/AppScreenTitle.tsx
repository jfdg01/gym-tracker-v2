import React from 'react';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/src/utils/cn';

interface AppScreenTitleProps {
    title: string;
    subtitle?: string;
    className?: string;
}

/**
 * A standardized screen title component for main tab screens.
 * Use this for the primary heading of a screen (e.g., "Gym Tracker", "Settings").
 * For sub-section headings within a screen, use the regular Heading component.
 */
export const AppScreenTitle = ({ title, subtitle, className }: AppScreenTitleProps) => {
    return (
        <VStack className={cn("my-2", className)}>
            <Heading
                size="2xl"
                className="text-white font-heading mt-5 text-center"
                style={{
                    fontSize: 28,
                    fontWeight: '700',
                    letterSpacing: -0.5
                }}
            >
                {title}
            </Heading>
            {subtitle && (
                <Text className="text-typography-400 text-sm mt-1">
                    {subtitle}
                </Text>
            )}
        </VStack>
    );
};
