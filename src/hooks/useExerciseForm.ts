
import { useState, useEffect, useRef } from 'react';
import { Exercise, ExerciseSettings, TrackingType, ResistanceType } from '@/src/types/domain';

interface UseExerciseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Exercise>, settings: Partial<ExerciseSettings>) => Promise<void>;
    initialData?: Exercise | null;
    initialSettings?: ExerciseSettings | null;
}

export const useExerciseForm = ({ isOpen, onClose, onSubmit, initialData, initialSettings }: UseExerciseFormProps) => {
    // Layout State
    const [trackingType, setTrackingType] = useState<TrackingType>(TrackingType.REPS);
    const [resistanceType, setResistanceType] = useState<ResistanceType>(ResistanceType.WEIGHT);
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
    const [category, setCategory] = useState('');


    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                nameRef.current = initialData.name;
                descriptionRef.current = initialData.description || '';
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


            ignoreSaveRef.current = false;
            setErrors({});

            // Force re-mount inputs
            setFormKey(prev => prev + 1);
        }
    }, [initialData, initialSettings, isOpen]);

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
                description: descriptionRef.current,
                category,
                defaultTrackingType: trackingType,
                defaultResistanceType: resistanceType,
            }, {
                // Keep these for now but they won't be edited here
                restTimeSeconds: initialSettings?.restTimeSeconds ?? 90,
                currentWeight: initialSettings?.currentWeight ?? 0,
                weightIncreaseFactor: initialSettings?.weightIncreaseFactor ?? 2.5,
                difficultyLevels: initialSettings?.difficultyLevels ?? [],
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
        const initCat = initialData?.category || '';
        const initTrack = initialData?.defaultTrackingType || TrackingType.REPS;
        const initResist = initialData?.defaultResistanceType || ResistanceType.WEIGHT;


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
            category,
            trackingType,
            resistanceType,
            formKey,
            showDiscardAlert,
            difficultyLevels: [],
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
    };
};
