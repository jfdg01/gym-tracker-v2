import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/src/utils/cn';

type AppCardProps = {
    children: React.ReactNode;
    variant?: 'elevated' | 'outline' | 'ghost';
    className?: string;
    style?: any;
};

export const AppCard = ({
    children,
    variant = 'elevated',
    className,
    style
}: AppCardProps) => {

    const variantStyles = {
        elevated: 'bg-surface-elevated border-0',
        outline: 'bg-transparent border border-outline-dark/10',
        ghost: 'bg-transparent border-0 p-0',
    };

    const shadowStyle = variant === 'elevated' ? {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    } : {};

    return (
        <Card
            className={cn(variantStyles[variant], 'p-4 rounded-xl', className)}
            style={[shadowStyle, style]}
        >
            {children}
        </Card>
    );
};
