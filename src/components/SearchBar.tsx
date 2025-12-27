import React, { useState, useEffect, useCallback, memo } from 'react';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SearchIcon, X } from 'lucide-react-native';

interface SearchBarProps {
    value?: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

export const SearchBar = memo(({ value = '', onChangeText, placeholder = "Search...", onClear }: SearchBarProps) => {
    // Hybrid Ref Pattern: Local state for immediate UI updates
    const [localValue, setLocalValue] = useState(value);

    // Sync from parent (e.g. clear command)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChangeText = useCallback((text: string) => {
        setLocalValue(text);
        onChangeText(text);
    }, [onChangeText]);

    const handleClear = useCallback(() => {
        setLocalValue('');
        onChangeText('');
        if (onClear) onClear();
    }, [onChangeText, onClear]);

    return (
        <Input variant="outline" size="md" className="w-full bg-background-50 border-background-200">
            <InputSlot className="pl-3">
                <InputIcon as={SearchIcon} className="text-typography-400" />
            </InputSlot>
            <InputField
                value={localValue}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                className="text-typography-900"
                autoCorrect={false}
                collapsable={false} // Fabric optimization
            />
            {localValue.length > 0 && (
                <InputSlot className="pr-3" onPress={handleClear}>
                    <InputIcon as={X} className="text-typography-400" />
                </InputSlot>
            )}
        </Input>
    );
});
