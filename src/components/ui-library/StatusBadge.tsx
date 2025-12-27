import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { cn } from '@/src/utils/cn';

type StatusBadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
    label: string;
    variant?: StatusBadgeVariant;
    className?: string;
}

export const StatusBadge = ({ label, variant = 'neutral', className }: StatusBadgeProps) => {
    const variantColors: Record<StatusBadgeVariant, string> = {
        primary: 'rgb(79, 70, 229)',    // Indigo
        secondary: 'rgb(99, 102, 241)',  // Indigo lighter
        success: 'rgb(34, 197, 94)',    // Green
        warning: 'rgb(234, 179, 8)',    // Yellow
        error: 'rgb(239, 68, 68)',      // Red
        info: 'rgb(59, 130, 246)',       // Blue
        neutral: 'rgb(100, 116, 139)',   // Slate
    };

    const color = variantColors[variant];

    return (
        <Box
            className={cn(
                "px-2 py-0.5 rounded-full border items-center justify-center self-start",
                className
            )}
            style={{
                backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
                borderColor: color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
            }}
        >
            <Text
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color }}
            >
                {label}
            </Text>
        </Box>
    );
};
