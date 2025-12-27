import React, { useCallback } from 'react';
import { ProgramDayExercise, TrackingType, ResistanceType, Exercise } from '@/src/types/domain';
import { useProgramDayExerciseForm } from '@/src/hooks/useProgramDayExerciseForm';
import { AppFormSheet } from './ui-library/AppFormSheet';
import { AppFormField } from './ui-library/AppFormField';
import { AppSelect } from './ui-library/AppSelect';
import { AppButton } from './ui-library/AppButton';
import { HStack } from '@/components/ui/hstack';
import { AppInput } from './ui-library/AppInput';

interface ProgramDayExerciseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<ProgramDayExercise>) => Promise<void>;
    initialData?: ProgramDayExercise | null;
    selectedExercise?: Exercise | null;
}

export const ProgramDayExerciseForm = (props: ProgramDayExerciseFormProps) => {
    const { isOpen, initialData, selectedExercise } = props;
    const {
        formState: {
            loading,
            trackingType,
            resistanceType,
        },
        actions: {
            setTrackingType,
            setResistanceType,
            handleManualSave,
            handleSheetClose,
        },
        refs: {
            setsRef,
            targetRepsRef,
            targetTimeRef,
        }
    } = useProgramDayExerciseForm(props);

    // Stable callbacks for Hybrid Ref Pattern
    const onSetsChange = useCallback((t: string) => { setsRef.current = t; }, []);
    const onRepsChange = useCallback((t: string) => { targetRepsRef.current = t; }, []);
    const onTimeChange = useCallback((t: string) => { targetTimeRef.current = t; }, []);

    const trackingOptions = [
        { label: 'Reps', value: TrackingType.REPS },
        { label: 'Time', value: TrackingType.TIME },
    ];

    const resistanceOptions = [
        { label: 'Weight', value: ResistanceType.WEIGHT },
        { label: 'Difficulty', value: ResistanceType.DIFFICULTY },
    ];

    return (
        <AppFormSheet
            isOpen={isOpen}
            onClose={handleSheetClose}
            title={initialData ? 'Edit Exercise' : 'Add Exercise'}
            subTitle={selectedExercise?.name || ''}
        >
            <AppFormField label="Sets">
                <AppInput
                    value={setsRef.current}
                    onChangeText={onSetsChange}
                    placeholder="Number of sets"
                    keyboardType="numeric"
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

            {trackingType === TrackingType.REPS ? (
                <AppFormField label="Target Reps">
                    <AppInput
                        value={targetRepsRef.current}
                        onChangeText={onRepsChange}
                        placeholder="e.g. 10"
                        keyboardType="numeric"
                    />
                </AppFormField>
            ) : (
                <AppFormField label="Target Time (Seconds)">
                    <AppInput
                        value={targetTimeRef.current}
                        onChangeText={onTimeChange}
                        placeholder="e.g. 60"
                        keyboardType="numeric"
                    />
                </AppFormField>
            )}

            <AppButton
                title={loading ? 'Saving...' : (initialData ? 'Update Exercise' : 'Confirm Exercise')}
                onPress={handleManualSave}
                loading={loading}
                action="primary"
                className="mt-6 mb-8 h-14 rounded-xl"
                textClassName="text-lg"
            />
        </AppFormSheet>
    );
};
