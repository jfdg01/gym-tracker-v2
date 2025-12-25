import React, { useEffect, useState } from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import {
    Actionsheet,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetBackdrop,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
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
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { ChevronDown } from 'lucide-react-native';
import { Exercise, TrackingType, ResistanceType } from '@/src/types/domain';

interface ExerciseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Exercise>) => Promise<void>;
    initialData?: Exercise | null;
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

export const ExerciseForm = ({ isOpen, onClose, onSubmit, initialData }: ExerciseFormProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [trackingType, setTrackingType] = useState<TrackingType>(TrackingType.REPS);
    const [resistanceType, setResistanceType] = useState<ResistanceType>(ResistanceType.WEIGHT);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setCategory(initialData.category || '');
            setTrackingType(initialData.defaultTrackingType);
            setResistanceType(initialData.defaultResistanceType);
        } else {
            setName('');
            setDescription('');
            setCategory('');
            setTrackingType(TrackingType.REPS);
            setResistanceType(ResistanceType.WEIGHT);
        }
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onSubmit({
                name,
                description,
                category,
                defaultTrackingType: trackingType,
                defaultResistanceType: resistanceType,
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
            <ActionsheetContent className="pb-10">
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>

                <VStack space="md" className="w-full p-4 mb-8">
                    <Text className="text-xl font-bold text-typography-900">
                        {initialData ? 'Edit Exercise' : 'New Exercise'}
                    </Text>

                    <VStack space="sm">
                        <Text className="text-sm font-medium text-typography-700">Name</Text>
                        <Input>
                            <InputField
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. Bench Press"
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
                            <Text className="text-sm font-medium text-typography-700">Tracking (Default)</Text>
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
                            <Text className="text-sm font-medium text-typography-700">Resistance (Default)</Text>
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

                    <VStack space="sm">
                        <Text className="text-sm font-medium text-typography-700">Description</Text>
                        <Textarea>
                            <TextareaInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Optional notes..."
                            />
                        </Textarea>
                    </VStack>

                    <Button
                        onPress={handleSubmit}
                        isDisabled={!name || loading}
                        className="mt-4"
                    >
                        <ButtonText>{loading ? 'Saving...' : 'Save Exercise'}</ButtonText>
                    </Button>
                </VStack>
            </ActionsheetContent>
        </Actionsheet>
    );
};
