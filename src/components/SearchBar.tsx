import React from 'react';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SearchIcon, X } from 'lucide-react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

export const SearchBar = ({ value, onChangeText, placeholder = "Search...", onClear }: SearchBarProps) => {
    return (
        <Input variant="outline" size="md" className="w-full bg-background-50 border-background-200">
            <InputSlot className="pl-3">
                <InputIcon as={SearchIcon} className="text-typography-400" />
            </InputSlot>
            <InputField
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                className="text-typography-900"
                autoCorrect={false}
            />
            {value.length > 0 && (
                <InputSlot className="pr-3" onPress={() => {
                    onChangeText('');
                    if (onClear) onClear();
                }}>
                    <InputIcon as={X} className="text-typography-400" />
                </InputSlot>
            )}
        </Input>
    );
};
