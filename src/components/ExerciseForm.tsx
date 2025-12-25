import React from 'react';
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
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { X, ChevronDown } from 'lucide-react-native';
import { Exercise, ExerciseSettings, TrackingType, ResistanceType } from '@/src/types/domain';
import { useExerciseForm } from '@/src/hooks/useExerciseForm';

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

export const ExerciseForm = (props: ExerciseFormProps) => {
    const { isOpen, initialData } = props;
    const {
        formState: {
            loading,
            errors,
            category,
            trackingType,
            resistanceType,
            formKey,
            showDiscardAlert,
        },
        actions: {
            setCategory,
            setTrackingType,
            setResistanceType,
            setShowDiscardAlert,
            handleManualSave,
            handleSheetClose,
            handleDiscardPress,
            confirmDiscard,
            setErrors,
        },
        refs: {
            nameRef,
            descriptionRef,
            restTimeRef,
            currentWeightRef,
            weightFactorRef,
            difficultyLevelsRef,
        }
    } = useExerciseForm(props);

    return (
        <>
            <Actionsheet isOpen={isOpen} onClose={handleSheetClose}>
                <ActionsheetBackdrop />
                <ActionsheetContent className="max-h-[85%]">
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>

                    <ActionsheetScrollView className="w-full">
                        <VStack space="md" className="w-full p-4 mb-8" key={formKey}>
                            <HStack className="w-full justify-between items-center">
                                <Text className="text-xl font-bold text-typography-900">
                                    {initialData ? 'Edit Exercise' : 'New Exercise'}
                                </Text>
                                <Button size="sm" variant="link" onPress={handleDiscardPress} className="p-0">
                                    <Icon as={X} size="xl" className="text-typography-500" />
                                </Button>
                            </HStack>

                            <VStack space="sm">
                                <Text className="text-sm font-medium text-typography-700">Name <Text className="text-error-500">*</Text></Text>
                                <Input isInvalid={!!errors.name}>
                                    <InputField
                                        defaultValue={nameRef.current}
                                        onChangeText={(t) => { nameRef.current = t; if (errors.name) setErrors({ ...errors, name: '' }); }}
                                        placeholder="e.g. Bench Press"
                                        autoCorrect={false}
                                    />
                                </Input>
                                {errors.name && <Text className="text-error-500 text-xs">{errors.name}</Text>}
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
                                <Text className="text-sm font-medium text-typography-700">Rest Time (Seconds) <Text className="text-error-500">*</Text></Text>
                                <Input isInvalid={!!errors.restTime}>
                                    <InputField
                                        defaultValue={restTimeRef.current}
                                        onChangeText={(t) => { restTimeRef.current = t; if (errors.restTime) setErrors({ ...errors, restTime: '' }); }}
                                        placeholder="e.g. 90"
                                        keyboardType="numeric"
                                    />
                                </Input>
                                {errors.restTime && <Text className="text-error-500 text-xs">{errors.restTime}</Text>}
                            </VStack>

                            {resistanceType === ResistanceType.WEIGHT && (
                                <HStack space="md" className="w-full">
                                    <VStack space="sm" className="flex-1">
                                        <Text className="text-sm font-medium text-typography-700">Start Weight (kg)</Text>
                                        <Input isInvalid={!!errors.currentWeight}>
                                            <InputField
                                                defaultValue={currentWeightRef.current}
                                                onChangeText={(t) => { currentWeightRef.current = t; if (errors.currentWeight) setErrors({ ...errors, currentWeight: '' }); }}
                                                placeholder="e.g. 20"
                                                keyboardType="numeric"
                                            />
                                        </Input>
                                        {errors.currentWeight && <Text className="text-error-500 text-xs">{errors.currentWeight}</Text>}
                                    </VStack>
                                    <VStack space="sm" className="flex-1">
                                        <Text className="text-sm font-medium text-typography-700">Increase (kg)</Text>
                                        <Input isInvalid={!!errors.weightFactor}>
                                            <InputField
                                                defaultValue={weightFactorRef.current}
                                                onChangeText={(t) => { weightFactorRef.current = t; if (errors.weightFactor) setErrors({ ...errors, weightFactor: '' }); }}
                                                placeholder="e.g. 2.5"
                                                keyboardType="numeric"
                                            />
                                        </Input>
                                        {errors.weightFactor && <Text className="text-error-500 text-xs">{errors.weightFactor}</Text>}
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
                                onPress={handleManualSave}
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

            <AlertDialog isOpen={showDiscardAlert} onClose={() => setShowDiscardAlert(false)}>
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading size="md" className="text-typography-950">Discard Changes?</Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text size="sm" className="text-typography-500">
                            You are about to exit without saving. Any changes needed will be lost.
                            Are you sure?
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            action="secondary"
                            onPress={() => setShowDiscardAlert(false)}
                            size="sm"
                            className="mr-3"
                        >
                            <ButtonText>Keep Editing</ButtonText>
                        </Button>
                        <Button
                            action="negative"
                            onPress={confirmDiscard}
                            size="sm"
                        >
                            <ButtonText>Discard</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
