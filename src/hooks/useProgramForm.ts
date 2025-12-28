import { useState, useEffect, useRef } from 'react';
import { Program } from '@/src/types/domain';

interface UseProgramFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Program>) => Promise<void>;
    initialData?: Program | null;
}

export const useProgramForm = ({ isOpen, onClose, onSubmit, initialData }: UseProgramFormProps) => {
    // Layout State
    const [loading, setLoading] = useState(false);
    const [formKey, setFormKey] = useState(0);

    // Dialog State
    const [showDiscardAlert, setShowDiscardAlert] = useState(false);
    const ignoreSaveRef = useRef(false);

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form Data Refs
    const nameRef = useRef('');
    const descriptionRef = useRef('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                nameRef.current = initialData.name;
                descriptionRef.current = initialData.description || '';
            } else {
                nameRef.current = '';
                descriptionRef.current = '';
            }

            ignoreSaveRef.current = false;
            setErrors({});

            // Force re-mount inputs
            setFormKey(prev => prev + 1);
        }
    }, [initialData, isOpen]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!nameRef.current.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const saveChanges = async (silent: boolean = false) => {
        if (!validate()) {
            if (silent) {
                console.warn("Auto-save failed validation");
            }
            return false;
        }

        if (!silent) setLoading(true);
        try {
            await onSubmit({
                name: nameRef.current.trim(),
                description: descriptionRef.current.trim() || null,
            });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const hasChanges = () => {
        const initName = initialData?.name || '';
        const initDesc = initialData?.description || '';

        const currName = nameRef.current.trim();
        const currDesc = descriptionRef.current.trim();

        if (currName !== initName) return true;
        if (currDesc !== initDesc) return true;

        return false;
    };

    const handleSheetClose = () => {
        if (!ignoreSaveRef.current) {
            saveChanges(true);
        }
        onClose();
    };

    const handleManualSave = async () => {
        const success = await saveChanges(false);
        if (success) onClose();
    };

    const handleDiscardPress = () => {
        if (!hasChanges()) {
            ignoreSaveRef.current = true;
            onClose();
            return;
        }
        setShowDiscardAlert(true);
    };

    const confirmDiscard = () => {
        ignoreSaveRef.current = true;
        setShowDiscardAlert(false);
        onClose();
    };

    return {
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
    };
};
