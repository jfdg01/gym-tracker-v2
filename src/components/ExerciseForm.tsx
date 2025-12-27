import React, { useCallback } from 'react';
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

    const onDifficultyChange = useCallback((t: string) => {
        difficultyLevelsRef.current = t;
    }, []);

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
                    <AppFormField label="Difficulty Levels (comma separated)">
                        <AppInput
                            value={difficultyLevelsRef.current}
                            onChangeText={onDifficultyChange}
                            placeholder="e.g. Beginner, Intermediate, Advanced"
                            key={`${formKey}-diff`}
                        />
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
                    className="mt-6 mb-8 h-14 rounded-xl"
                    textClassName="text-lg"
                />
            </AppFormSheet>

            <AppDiscardDialog
                isOpen={showDiscardAlert}
                onClose={() => setShowDiscardAlert(false)}
                onConfirm={confirmDiscard}
            />
        </>
    );
};
