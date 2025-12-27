import React from 'react';
import { Button, ButtonText, ButtonIcon, ButtonSpinner } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react-native';
import { cn } from '@/src/utils/cn';

type AppButtonProps = {
    title: string;
    onPress?: () => void;
    variant?: 'solid' | 'outline' | 'link';
    action?: 'primary' | 'secondary' | 'negative' | 'positive' | 'default';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
    style?: any;
};

export const AppButton = ({
    title,
    onPress,
    variant = 'solid',
    action = 'default',
    size = 'md',
    icon: IconComponent,
    loading = false,
    disabled = false,
    className,
    textClassName,
    style,
}: AppButtonProps) => {

    // Custom action mapping for our design system
    const actionStyles = {
        primary: 'bg-primary-energy active:bg-primary-energy/80',
        positive: 'bg-success-growth active:bg-success-growth/80',
        negative: 'bg-error-critical active:bg-error-critical/80',
        secondary: 'bg-surface-elevated active:bg-surface-elevated/80',
        default: 'bg-background-dark/50 active:bg-background-dark/30',
    };

    const variantStyles = {
        solid: actionStyles[action as keyof typeof actionStyles] || actionStyles.default,
        outline: 'bg-transparent border border-outline-dark/20',
        link: 'bg-transparent px-0',
    };

    // Text color logic
    const textColorClasses = cn(
        'font-bold',
        variant === 'outline' && action === 'primary' ? 'text-primary-energy' :
            variant === 'outline' && action === 'negative' ? 'text-error-critical' :
                variant === 'solid' ? 'text-white' : 'text-typography-900',
        textClassName
    );

    return (
        <Button
            onPress={onPress}
            disabled={disabled || loading}
            className={cn(
                variantStyles[variant],
                className
            )}
            style={style}
            size={size}
        >
            {loading ? (
                <ButtonSpinner color="white" />
            ) : (
                <>
                    {IconComponent && (
                        <ButtonIcon as={IconComponent} className={cn(textColorClasses)} />
                    )}
                    <ButtonText className={textColorClasses}>
                        {title}
                    </ButtonText>
                </>
            )}
        </Button>
    );
};
