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

    return (
        <AppFormSheet
            isOpen={isOpen}
            onClose={handleSheetClose}
            title={initialData ? 'Edit Exercise' : 'Add Exercise'}
            subTitle={selectedExercise?.name || ''}
        >
            <HStack space="md" className="w-full">
                <AppFormField label="Sets" className="flex-1">
                    <AppInput
                        value={setsRef.current}
                        onChangeText={onSetsChange}
                        placeholder="Number of sets"
                        keyboardType="numeric"
                    />
                </AppFormField>

                {trackingType === TrackingType.REPS ? (
                    <AppFormField label="Target Reps" className="flex-1">
                        <AppInput
                            value={targetRepsRef.current}
                            onChangeText={onRepsChange}
                            placeholder="e.g. 10"
                            keyboardType="numeric"
                        />
                    </AppFormField>
                ) : (
                    <AppFormField label="Target Time (s)" className="flex-1">
                        <AppInput
                            value={targetTimeRef.current}
                            onChangeText={onTimeChange}
                            placeholder="e.g. 60"
                            keyboardType="numeric"
                        />
                    </AppFormField>
                )}
            </HStack>

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
