import React, { useEffect, useState } from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import {
    Actionsheet,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetBackdrop,
    ActionsheetScrollView,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
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
import { Icon } from '@/components/ui/icon';
import { ChevronDown } from 'lucide-react-native';
import { Exercise, ExerciseSettings, TrackingType, ResistanceType } from '@/src/types/domain';

interface ExerciseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Exercise>, settings: Partial<ExerciseSettings>) => Promise<void>;
    initialData?: Exercise | null;
    initialSettings?: ExerciseSettings | null;
}

const CATEGORIES = [
    'Strength',
    'Cardio',
    'Flexibility',
    'Plyometrics',
    'Powerlifting',
    'Strongman',
    'Olympic Weightlifting',
];

export const ExerciseForm = ({ isOpen, onClose, onSubmit, initialData, initialSettings }: ExerciseFormProps) => {
    // Layout State (needs re-render)
    const [trackingType, setTrackingType] = useState<TrackingType>(TrackingType.REPS);
    const [resistanceType, setResistanceType] = useState<ResistanceType>(ResistanceType.WEIGHT);
    const [loading, setLoading] = useState(false);
    const [formKey, setFormKey] = useState(0);

    // Form Data Refs (No re-render on typing)
    const nameRef = React.useRef('');
    const descriptionRef = React.useRef('');
    const categoryRef = React.useRef(''); // Category usually triggers re-render if it changes UI, but for a simple select it can be ref if the select component supports it. Gluestack select value prop is controlled. Let's keep category state if Select requires it. 
    // Actually Gluestack Select is controlled. Let's keep Category as State for safety, or use Select's internal state if possible. 
    // Given the previous code, let's keep Category as state to be safe with the Select component quirkiness, but if it doesn't change layout, maybe ref is fine? 
    // Wait, let's check Select docs. It takes `selectedValue`. So it MUST be controlled. 
    // We will keep Category controlled, but Name/Desc/Numbers as Refs.
    const [category, setCategory] = useState('');

    const restTimeRef = React.useRef('90');
    const currentWeightRef = React.useRef('');
    const weightFactorRef = React.useRef('2.5');
    const difficultyLevelsRef = React.useRef('');

    useEffect(() => {
        if (isOpen) {
            // Reset Refs based on initialData
            if (initialData) {
                nameRef.current = initialData.name;
                descriptionRef.current = initialData.description || '';
                // Update State for Controlled components
                setCategory(initialData.category || '');
                setTrackingType(initialData.defaultTrackingType);
                setResistanceType(initialData.defaultResistanceType);
            } else {
                nameRef.current = '';
                descriptionRef.current = '';
                setCategory('');
                setTrackingType(TrackingType.REPS);
                setResistanceType(ResistanceType.WEIGHT);
            }

            // Settings Refs
            if (initialSettings) {
                restTimeRef.current = initialSettings.restTimeSeconds?.toString() || '90';
                currentWeightRef.current = initialSettings.currentWeight?.toString() || '';
                weightFactorRef.current = initialSettings.weightIncreaseFactor?.toString() || '2.5';
                difficultyLevelsRef.current = initialSettings.difficultyLevels?.join(', ') || '';
            } else {
                restTimeRef.current = '90';
                currentWeightRef.current = '';
                weightFactorRef.current = '2.5';
                difficultyLevelsRef.current = '';
            }

            // Force re-mount of inputs to pick up new defaultValues
            setFormKey(prev => prev + 1);
        }
    }, [initialData, initialSettings, isOpen]);

    const handleSubmit = async () => {
        const nameVal = nameRef.current.trim();
        if (!nameVal) return; // Could add Alert here

        setLoading(true);
        try {
            await onSubmit({
                name: nameVal,
                description: descriptionRef.current,
                category,
                defaultTrackingType: trackingType,
                defaultResistanceType: resistanceType,
            }, {
                restTimeSeconds: parseInt(restTimeRef.current) || 90,
                currentWeight: parseFloat(currentWeightRef.current) || null,
                weightIncreaseFactor: parseFloat(weightFactorRef.current) || null,
                difficultyLevels: difficultyLevelsRef.current.split(',').map(s => s.trim()).filter(Boolean),
            });
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent className="max-h-[85%]">
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>

                <ActionsheetScrollView className="w-full">
                    <VStack space="md" className="w-full p-4 mb-8" key={formKey}>
                        <Text className="text-xl font-bold text-typography-900">
                            {initialData ? 'Edit Exercise' : 'New Exercise'}
                        </Text>

                        <VStack space="sm">
                            <Text className="text-sm font-medium text-typography-700">Name</Text>
                            <Input>
                                <InputField
                                    defaultValue={nameRef.current}
                                    onChangeText={(t) => nameRef.current = t}
                                    placeholder="e.g. Bench Press"
                                    autoCorrect={false}
                                />
                            </Input>
                        </VStack>

                        <VStack space="sm">
                            <Text className="text-sm font-medium text-typography-700">Category</Text>
                            <Select selectedValue={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectInput placeholder="Select category" />
                                    <SelectIcon as={ChevronDown} className="mr-3" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} label={cat} value={cat} />
                                        ))}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </VStack>

                        <HStack space="md" className="w-full">
                            <VStack space="sm" className="flex-1">
                                <Text className="text-sm font-medium text-typography-700">Tracking</Text>
                                <Select selectedValue={trackingType} onValueChange={(v) => setTrackingType(v as TrackingType)}>
                                    <SelectTrigger>
                                        <SelectInput placeholder="Type" />
                                        <SelectIcon as={ChevronDown} className="mr-3" />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectItem label="Reps" value={TrackingType.REPS} />
                                            <SelectItem label="Time" value={TrackingType.TIME} />
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </VStack>

                            <VStack space="sm" className="flex-1">
                                <Text className="text-sm font-medium text-typography-700">Resistance</Text>
                                <Select selectedValue={resistanceType} onValueChange={(v) => setResistanceType(v as ResistanceType)}>
                                    <SelectTrigger>
                                        <SelectInput placeholder="Type" />
                                        <SelectIcon as={ChevronDown} className="mr-3" />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectItem label="Weight" value={ResistanceType.WEIGHT} />
                                            <SelectItem label="Difficulty" value={ResistanceType.DIFFICULTY} />
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </VStack>
                        </HStack>

                        <Text className="text-lg font-bold text-typography-900 mt-2">Defaults & Progression</Text>

                        <VStack space="sm">
                            <Text className="text-sm font-medium text-typography-700">Rest Time (Seconds)</Text>
                            <Input>
                                <InputField
                                    defaultValue={restTimeRef.current}
                                    onChangeText={(t) => restTimeRef.current = t}
                                    placeholder="e.g. 90"
                                    keyboardType="numeric"
                                />
                            </Input>
                        </VStack>

                        {resistanceType === ResistanceType.WEIGHT && (
                            <HStack space="md" className="w-full">
                                <VStack space="sm" className="flex-1">
                                    <Text className="text-sm font-medium text-typography-700">Start Weight (kg)</Text>
                                    <Input>
                                        <InputField
                                            defaultValue={currentWeightRef.current}
                                            onChangeText={(t) => currentWeightRef.current = t}
                                            placeholder="e.g. 20"
                                            keyboardType="numeric"
                                        />
                                    </Input>
                                </VStack>
                                <VStack space="sm" className="flex-1">
                                    <Text className="text-sm font-medium text-typography-700">Increase (kg)</Text>
                                    <Input>
                                        <InputField
                                            defaultValue={weightFactorRef.current}
                                            onChangeText={(t) => weightFactorRef.current = t}
                                            placeholder="e.g. 2.5"
                                            keyboardType="numeric"
                                        />
                                    </Input>
                                </VStack>
                            </HStack>
                        )}

                        {resistanceType === ResistanceType.DIFFICULTY && (
                            <VStack space="sm">
                                <Text className="text-sm font-medium text-typography-700">Difficulty Levels (comma separated)</Text>
                                <Input>
                                    <InputField
                                        defaultValue={difficultyLevelsRef.current}
                                        onChangeText={(t) => difficultyLevelsRef.current = t}
                                        placeholder="e.g. Beginner, Intermediate, Advanced"
                                        autoCorrect={false}
                                    />
                                </Input>
                            </VStack>
                        )}

                        <VStack space="sm">
                            <Text className="text-sm font-medium text-typography-700">Description</Text>
                            <Textarea>
                                <TextareaInput
                                    defaultValue={descriptionRef.current}
                                    onChangeText={(t) => descriptionRef.current = t}
                                    placeholder="Optional notes..."
                                    autoCorrect={false}
                                />
                            </Textarea>
                        </VStack>

                        <Button
                            onPress={handleSubmit}
                            isDisabled={loading}
                            className="mt-4 mb-8"
                        >
                            {loading && <Spinner color="white" className="mr-2" />}
                            <ButtonText>{loading ? 'Saving...' : 'Save Exercise'}</ButtonText>
                        </Button>
                    </VStack>
                </ActionsheetScrollView>
            </ActionsheetContent>
        </Actionsheet>
    );
};
