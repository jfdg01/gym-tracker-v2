import React, { useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { XIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AppCard } from './ui-library/AppCard';
import { HStack } from '@/components/ui/hstack';
import { Exercise, ExerciseSettings, TrackingType, ResistanceType } from '@/src/types/domain';
import { useExerciseForm } from '@/src/hooks/useExerciseForm';
import { AppFormSheet } from './ui-library/AppFormSheet';
import { AppFormField } from './ui-library/AppFormField';
import { AppSelect } from './ui-library/AppSelect';
import { AppDiscardDialog } from './ui-library/AppDiscardDialog';
import { AppButton } from './ui-library/AppButton';
import { AppInput } from './ui-library/AppInput';
import { AppTextarea } from './ui-library/AppTextarea';

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
].map(cat => ({ label: cat, value: cat }));

export const ExerciseForm = (props: ExerciseFormProps) => {
    const { isOpen, initialData } = props;
    const [newDifficulty, setNewDifficulty] = useState('');
    const {
        formState: {
            loading,
            errors,
            category,
            trackingType,
            resistanceType,
            formKey,
            showDiscardAlert,
            difficultyLevels,
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
            addDifficulty,
            removeDifficulty,
        },
        refs: {
            nameRef,
            descriptionRef,
            restTimeRef,
            currentWeightRef,
            weightFactorRef,
        }
    } = useExerciseForm(props);

    // Stable callbacks for Hybrid Ref Pattern
    const onNameChange = useCallback((t: string) => {
        nameRef.current = t;
        if (errors.name) setErrors({ ...errors, name: '' });
    }, [errors.name, setErrors]);

    const onRestChange = useCallback((t: string) => {
        restTimeRef.current = t;
        if (errors.restTime) setErrors({ ...errors, restTime: '' });
    }, [errors.restTime, setErrors]);

    const onWeightChange = useCallback((t: string) => {
        currentWeightRef.current = t;
        if (errors.currentWeight) setErrors({ ...errors, currentWeight: '' });
    }, [errors.currentWeight, setErrors]);

    const onFactorChange = useCallback((t: string) => {
        weightFactorRef.current = t;
        if (errors.weightFactor) setErrors({ ...errors, weightFactor: '' });
    }, [errors.weightFactor, setErrors]);



    const onDescriptionChange = useCallback((t: string) => {
        descriptionRef.current = t;
    }, []);

    const trackingOptions = [
        { label: 'Reps', value: TrackingType.REPS },
        { label: 'Time', value: TrackingType.TIME },
    ];

    const resistanceOptions = [
        { label: 'Weight', value: ResistanceType.WEIGHT },
        { label: 'Difficulty', value: ResistanceType.DIFFICULTY },
    ];

    return (
        <>
            <AppFormSheet
                isOpen={isOpen}
                onClose={handleSheetClose}
                title={initialData ? 'Edit Exercise' : 'New Exercise'}
            >
                <AppFormField label="Name" required error={errors.name}>
                    <AppInput
                        value={nameRef.current}
                        onChangeText={onNameChange}
                        placeholder="e.g. Bench Press"
                        isInvalid={!!errors.name}
                        key={`${formKey}-name`}
                    />
                </AppFormField>

                <AppFormField label="Category">
                    <AppSelect
                        value={category}
                        onValueChange={setCategory}
                        placeholder="Select category"
                        options={CATEGORIES}
                    />
                </AppFormField>

                <HStack space="md" className="w-full">
                    <AppFormField label="Tracking" className="flex-1">
                        <AppSelect
                            value={trackingType}
                            onValueChange={(v) => setTrackingType(v as TrackingType)}
                            options={trackingOptions}
                        />
                    </AppFormField>

                    <AppFormField label="Resistance" className="flex-1">
                        <AppSelect
                            value={resistanceType}
                            onValueChange={(v) => setResistanceType(v as ResistanceType)}
                            options={resistanceOptions}
                        />
                    </AppFormField>
                </HStack>

                <AppFormField label="Rest Time (Seconds)" required error={errors.restTime}>
                    <AppInput
                        value={restTimeRef.current}
                        onChangeText={onRestChange}
                        placeholder="e.g. 90"
                        keyboardType="numeric"
                        isInvalid={!!errors.restTime}
                        key={`${formKey}-rest`}
                    />
                </AppFormField>

                {resistanceType === ResistanceType.WEIGHT && (
                    <HStack space="md" className="w-full">
                        <AppFormField label="Start Weight (kg)" error={errors.currentWeight} className="flex-1">
                            <AppInput
                                value={currentWeightRef.current}
                                onChangeText={onWeightChange}
                                placeholder="e.g. 20"
                                keyboardType="numeric"
                                isInvalid={!!errors.currentWeight}
                                key={`${formKey}-weight`}
                            />
                        </AppFormField>
                        <AppFormField label="Increase (kg)" error={errors.weightFactor} className="flex-1">
                            <AppInput
                                value={weightFactorRef.current}
                                onChangeText={onFactorChange}
                                placeholder="e.g. 2.5"
                                keyboardType="numeric"
                                isInvalid={!!errors.weightFactor}
                                key={`${formKey}-factor`}
                            />
                        </AppFormField>
                    </HStack>
                )}

                {resistanceType === ResistanceType.DIFFICULTY && (
                    <AppFormField label="Difficulty Levels">
                        <AppCard className="p-4">
                            <VStack space="md">
                                <VStack space="xs" className="divide-y divide-white/5">
                                    {difficultyLevels.map((level, index) => (
                                        <HStack key={index} className="justify-between items-center py-2">
                                            <Text className="text-typography-900 font-medium">{level}</Text>
                                            <Pressable
                                                onPress={() => removeDifficulty(index)}
                                                className="p-2 opacity-70 active:opacity-100"
                                            >
                                                <Icon as={XIcon} size="xs" className="text-error-500" />
                                            </Pressable>
                                        </HStack>
                                    ))}
                                    {difficultyLevels.length === 0 && (
                                        <Text className="text-typography-500 italic py-2">No levels defined</Text>
                                    )}
                                </VStack>

                                <HStack space="sm" className="items-center mt-2">
                                    <AppInput
                                        value={newDifficulty}
                                        onChangeText={setNewDifficulty}
                                        placeholder="Add difficulty (e.g. Red)"
                                        className="flex-1 h-10"
                                        inputClassName="text-sm"
                                    />
                                    <AppButton
                                        title="Add"
                                        onPress={() => {
                                            if (newDifficulty.trim()) {
                                                addDifficulty(newDifficulty);
                                                setNewDifficulty('');
                                            }
                                        }}
                                        size="sm"
                                        variant="outline"
                                        action="primary"
                                        className="h-10"
                                        disabled={!newDifficulty.trim()}
                                    />
                                </HStack>
                            </VStack>
                        </AppCard>
                    </AppFormField>
                )}

                <AppFormField label="Description">
                    <AppTextarea
                        value={descriptionRef.current}
                        onChangeText={onDescriptionChange}
                        placeholder="Optional notes..."
                        key={`${formKey}-desc`}
                    />
                </AppFormField>

                <AppButton
                    title={loading ? 'Saving...' : 'Save Exercise'}
                    onPress={handleManualSave}
                    loading={loading}
                    action="primary"
                    className="mt-6 mb-12 h-14 rounded-xl"
                    textClassName="text-lg"
                />
            </AppFormSheet >

            <AppDiscardDialog
                isOpen={showDiscardAlert}
                onClose={() => setShowDiscardAlert(false)}
                onConfirm={confirmDiscard}
            />
        </>
    );
};
