import React, { useState, useEffect, useCallback, memo } from 'react';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { cn } from '@/src/utils/cn';

interface AppTextareaProps {
    value?: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    autoCorrect?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    h?: number;
}

/**
 * AppTextarea follows the Hybrid Ref Pattern defined in docs/coding-standards.md
 * It manages local state for 60fps UI responsiveness while silently updating the parent data.
 */
export const AppTextarea = memo(({
    value = '',
    onChangeText,
    placeholder,
    className,
    inputClassName,
    autoCorrect = false,
    disabled = false,
    isInvalid = false,
    h = 120,
}: AppTextareaProps) => {
    // Local state for immediate UI feedback
    const [localValue, setLocalValue] = useState(value);

    // Sync from parent
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChangeText = useCallback((text: string) => {
        setLocalValue(text);
        onChangeText(text);
    }, [onChangeText]);

    return (
        <Textarea
            isDisabled={disabled}
            isInvalid={isInvalid}
            className={cn("bg-background-dark/30 border-outline-dark/20", className)}
            style={{ height: h }}
        >
            <TextareaInput
                value={localValue}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                className={cn("text-typography-900", inputClassName)}
                autoCorrect={autoCorrect}
                collapsable={false} // Fabric optimization
            />
        </Textarea>
    );
});
