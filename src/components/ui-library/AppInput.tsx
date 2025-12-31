import React, { useState, useEffect, useCallback, memo } from 'react';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { cn } from '@/src/utils/cn';

interface AppInputProps {
    value?: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    icon?: any;
    autoCorrect?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    autoFocus?: boolean;
}

/**
 * AppInput follows the Hybrid Ref Pattern defined in docs/coding-standards.md
 * It manages local state for 60fps UI responsiveness while silently updating the parent data.
 */
export const AppInput = memo(({
    value = '',
    onChangeText,
    placeholder,
    className,
    inputClassName,
    icon,
    autoCorrect = false,
    keyboardType = 'default',
    secureTextEntry = false,
    disabled = false,
    isInvalid = false,
    autoFocus = false,
}: AppInputProps) => {
    // Local state for immediate UI feedback
    const [localValue, setLocalValue] = useState(value);

    // Sync from parent if value changes (e.g. form reset)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChangeText = useCallback((text: string) => {
        setLocalValue(text);
        onChangeText(text);
    }, [onChangeText]);

    return (
        <Input
            isDisabled={disabled}
            isInvalid={isInvalid}
            className={cn("h-12 bg-surface-elevated border-outline-dark/50", className)}
        >
            {icon && (
                <InputSlot className="pl-3">
                    <InputIcon as={icon} />
                </InputSlot>
            )}
            <InputField
                value={localValue}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                className={cn("text-white font-medium", inputClassName)}
                autoCorrect={autoCorrect}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                autoFocus={autoFocus}
                collapsable={false} // Fabric optimization as per standards
            />
        </Input>
    );
});
