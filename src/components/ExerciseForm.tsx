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
        },
        refs: {
            nameRef,
            descriptionRef,
        }
    } = useExerciseForm(props);

    // Stable callbacks for Hybrid Ref Pattern
    const onNameChange = useCallback((t: string) => {
        nameRef.current = t;
        if (errors.name) setErrors({ ...errors, name: '' });
    }, [errors.name, setErrors]);

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

                {/* Rest Time and Start Weight/Difficulty moved to ProgramDayExerciseForm */}


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
