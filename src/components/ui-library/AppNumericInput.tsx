import React, { useState, useCallback, memo, useEffect } from 'react';
import { TouchableOpacity, Vibration } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Plus, Minus, Hash } from 'lucide-react-native';
import { AppFormSheet } from './AppFormSheet';
import { AppInput } from './AppInput';
import { Input, InputField } from '@/components/ui/input';
import { cn } from '@/src/utils/cn';

interface AppNumericInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    quickValues?: number[];
    hideUnitDisplay?: boolean;
    className?: string;
}

const DEFAULT_QUICK_VALUES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25];

export const AppNumericInput = memo(({
    value,
    onChange,
    placeholder = "0",
    label,
    unit,
    min = 0,
    max = 999,
    step = 1,
    quickValues = DEFAULT_QUICK_VALUES,
    hideUnitDisplay = false,
    className,
}: AppNumericInputProps) => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    // Sync from parent if value changes (e.g. controlled update)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleValueChange = useCallback((newVal: string) => {
        // 1. Sanitization: Allow only numbers and a single decimal point
        // This prevents the "letter a" issue observed by the user
        let sanitized = newVal.replace(/[^0-9.]/g, '');

        // Handle multiple decimal points
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }

        // 2. Leading Zeros: "05" -> "5", but allow "0."
        if (sanitized.length > 1 && sanitized.startsWith('0') && sanitized[1] !== '.') {
            sanitized = sanitized.replace(/^0+/, '') || '0';
        }

        // 3. Validation & Boundaries
        // If the user types a value exceeding max, we cap it immediately
        if (max !== undefined && sanitized !== '') {
            const num = parseFloat(sanitized);
            if (num > max) {
                sanitized = max.toString();
            }
        }

        setLocalValue(sanitized);
        onChange(sanitized);
    }, [max, onChange]);

    const handleIncrement = useCallback(() => {
        const current = parseFloat(localValue) || 0;
        const next = current + step;
        if (max !== undefined && next > max) return;
        handleValueChange(next.toString());
        Vibration.vibrate(10);
    }, [localValue, step, max, handleValueChange]);

    const handleDecrement = useCallback(() => {
        const current = parseFloat(localValue) || 0;
        const next = current - step;
        if (min !== undefined && next < min) return;
        handleValueChange(next.toString());
        Vibration.vibrate(10);
    }, [localValue, step, min, handleValueChange]);

    const handleSelectQuickValue = useCallback((val: number) => {
        handleValueChange(val.toString());
        Vibration.vibrate(10);
        // Small delay to let the UI update before closing sheet
        setTimeout(() => {
            setIsSheetOpen(false);
        }, 100);
    }, [handleValueChange]);

    return (
        <HStack
            className={cn("items-center h-11 rounded-xl border overflow-hidden", className)}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
            {/* Decrement Button */}
            <TouchableOpacity
                onPress={handleDecrement}
                activeOpacity={0.6}
                className="w-10 h-full items-center justify-center bg-white/5 active:bg-white/10"
            >
                <Icon as={Minus} size="sm" className="text-typography-400" />
            </TouchableOpacity>

            {/* Main Interactive Area */}
            <TouchableOpacity
                onPress={() => setIsSheetOpen(true)}
                activeOpacity={0.7}
                className="flex-1 h-full flex-row items-center justify-center border-x border-white/10"
            >
                <Text size="md" className="text-white font-black" numberOfLines={1}>
                    {value || placeholder}
                </Text>
                {unit && !hideUnitDisplay && (
                    <Text
                        size="2xs"
                        className="text-typography-500 font-bold uppercase tracking-tighter ml-1"
                        numberOfLines={1}
                    >
                        {unit}
                    </Text>
                )}
            </TouchableOpacity>

            {/* Increment Button */}
            <TouchableOpacity
                onPress={handleIncrement}
                activeOpacity={0.6}
                className="w-10 h-full items-center justify-center bg-white/5 active:bg-white/10"
            >
                <Icon as={Plus} size="sm" className="text-typography-400" />
            </TouchableOpacity>

            {/* Selection Sheet */}
            <AppFormSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title={label || "Select Value"}
                subTitle={unit ? `In ${unit}` : undefined}
            >
                <Box className="w-full">
                    {/* Quick Selection Grid */}
                    <VStack space="xs" className="mb-6">
                        <Text size="xs" className="text-typography-500 font-bold uppercase tracking-widest mb-2 ml-1">
                            quick select
                        </Text>
                        <HStack className="flex-wrap justify-between" space="md">
                            {quickValues.map((val) => (
                                <TouchableOpacity
                                    key={val}
                                    onPress={() => handleSelectQuickValue(val)}
                                    className={cn(
                                        "w-[30.5%] aspect-[1.5/1] items-center justify-center rounded-2xl mb-3 border-2",
                                        value === val.toString()
                                            ? "border-primary-energy"
                                            : "border-white/10 active:border-white/20"
                                    )}
                                    style={value === val.toString()
                                        ? { backgroundColor: 'rgba(79, 70, 229, 0.2)' }
                                        : { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                                    }
                                >
                                    <Text
                                        size="xl"
                                        className={cn(
                                            "font-black tracking-tighter",
                                            value === val.toString() ? "text-primary-energy" : "text-white"
                                        )}
                                    >
                                        {val}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </HStack>
                    </VStack>

                    {/* Integrated Stepper Section (Manual adjustment) */}
                    <VStack space="xs">
                        <Text size="xs" className="text-typography-500 font-bold uppercase tracking-widest mb-2 ml-1">
                            current
                        </Text>
                        <Box
                            className="rounded-3xl border p-2"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                            <HStack space="sm" className="items-center h-20">
                                <TouchableOpacity
                                    onPress={handleDecrement}
                                    className="w-16 h-full items-center justify-center rounded-2xl active:bg-white/10"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                >
                                    <Icon as={Minus} size="md" className="text-typography-400" />
                                </TouchableOpacity>

                                <Box
                                    className="flex-1 h-full rounded-2xl border overflow-hidden"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                                >
                                    <Input variant="underlined" className="h-full border-0">
                                        <InputField
                                            value={localValue}
                                            onChangeText={handleValueChange}
                                            keyboardType="decimal-pad"
                                            placeholder={placeholder}
                                            className="text-white font-black text-center text-3xl h-full leading-none p-0"
                                            style={{ textAlignVertical: 'center' }}
                                            autoCorrect={false}
                                            collapsable={false}
                                            selectTextOnFocus={true}
                                        />
                                        {unit && !hideUnitDisplay && (
                                            <Box className="absolute right-3 h-full justify-center">
                                                <Text size="xs" className="text-typography-500 font-black uppercase">
                                                    {unit}
                                                </Text>
                                            </Box>
                                        )}
                                    </Input>
                                </Box>

                                <TouchableOpacity
                                    onPress={handleIncrement}
                                    className="w-16 h-full items-center justify-center rounded-2xl active:bg-white/10"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                >
                                    <Icon as={Plus} size="md" className="text-typography-400" />
                                </TouchableOpacity>
                            </HStack>
                        </Box>
                    </VStack>

                    <Box className="h-8" />
                </Box>
            </AppFormSheet>
        </HStack>
    );
});
