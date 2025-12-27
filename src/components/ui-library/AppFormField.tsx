import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { cn } from '@/src/utils/cn';

interface AppFormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const AppFormField = ({
    label,
    error,
    required,
    children,
    className
}: AppFormFieldProps) => {
    return (
        <VStack space="xs" className={cn("w-full", className)}>
            <Text className="text-sm font-semibold text-typography-500">
                {label} {required && <Text className="text-error-critical">*</Text>}
            </Text>

            {children}

            {error && (
                <Text className="text-error-critical text-xs ml-1 font-medium italic">
                    {error}
                </Text>
            )}
        </VStack>
    );
};
