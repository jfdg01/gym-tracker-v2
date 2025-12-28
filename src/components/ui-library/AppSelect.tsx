import React from 'react';
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react-native';
import { cn } from '@/src/utils/cn';

interface AppSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    options: { label: string; value: string }[];
    disabled?: boolean;
}

export const AppSelect = ({
    value,
    onValueChange,
    placeholder = "Select option",
    options,
    disabled,
    className
}: AppSelectProps & { className?: string }) => {
    return (
        <Select
            selectedValue={value}
            onValueChange={onValueChange}
            isDisabled={disabled}
        >
            <SelectTrigger className={cn("bg-background-dark/30 border-outline-dark/20 h-12", className)}>
                <SelectInput
                    placeholder={placeholder}
                    className="text-typography-900"
                />
                <SelectIcon as={ChevronDown} className="mr-3 text-typography-400" />
            </SelectTrigger>
            <SelectPortal>
                <SelectBackdrop />
                <SelectContent className="bg-surface-elevated border-t border-outline-dark/10">
                    <SelectDragIndicatorWrapper>
                        <SelectDragIndicator className="bg-outline-dark/30" />
                    </SelectDragIndicatorWrapper>
                    {options.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                            className="py-3"
                        />
                    ))}
                </SelectContent>
            </SelectPortal>
        </Select>
    );
};
