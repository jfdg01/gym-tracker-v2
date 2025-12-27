import React, { useCallback } from 'react';
import { Program } from '@/src/types/domain';
import { useProgramForm } from '@/src/hooks/useProgramForm';
import { AppFormSheet } from './ui-library/AppFormSheet';
import { AppFormField } from './ui-library/AppFormField';
import { AppDiscardDialog } from './ui-library/AppDiscardDialog';
import { AppButton } from './ui-library/AppButton';
import { AppInput } from './ui-library/AppInput';
import { AppTextarea } from './ui-library/AppTextarea';

interface ProgramFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Program>) => Promise<void>;
    initialData?: Program | null;
}

export const ProgramForm = (props: ProgramFormProps) => {
    const { isOpen, initialData } = props;
    const {
        formState: {
            loading,
            errors,
            formKey,
            showDiscardAlert,
        },
        actions: {
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
    } = useProgramForm(props);

    // Stable callbacks for Hybrid Ref Pattern
    const onNameChange = useCallback((t: string) => {
        nameRef.current = t;
        if (errors.name) setErrors({ ...errors, name: '' });
    }, [errors.name, setErrors]);

    const onDescriptionChange = useCallback((t: string) => {
        descriptionRef.current = t;
    }, []);

    return (
        <>
            <AppFormSheet
                isOpen={isOpen}
                onClose={handleSheetClose}
                title={initialData ? 'Edit Program' : 'New Program'}
            >
                <AppFormField label="Name" required error={errors.name}>
                    <AppInput
                        value={nameRef.current}
                        onChangeText={onNameChange}
                        placeholder="e.g. Push Pull Legs"
                        isInvalid={!!errors.name}
                        key={`${formKey}-name`}
                    />
                </AppFormField>

                <AppFormField label="Description">
                    <AppTextarea
                        value={descriptionRef.current}
                        onChangeText={onDescriptionChange}
                        placeholder="Optional description of the program goals..."
                        key={`${formKey}-desc`}
                    />
                </AppFormField>

                <AppButton
                    title={loading ? 'Saving...' : 'Save Program'}
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
