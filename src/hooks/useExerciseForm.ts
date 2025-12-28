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

    const restTimeRef = useRef('90');
    const currentWeightRef = useRef('0');
    const weightFactorRef = useRef('2.5');
    const difficultyLevelsRef = useRef('');

    useEffect(() => {
        if (isOpen) {
            // Reset Refs based on initialData
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

            // Settings Refs
            if (initialSettings) {
                restTimeRef.current = initialSettings.restTimeSeconds?.toString() || '90';
                currentWeightRef.current = initialSettings.currentWeight?.toString() || '';
                weightFactorRef.current = initialSettings.weightIncreaseFactor?.toString() || '2.5';
                difficultyLevelsRef.current = initialSettings.difficultyLevels?.join(', ') || '';
            } else {
                restTimeRef.current = '90';
                currentWeightRef.current = '0';
                weightFactorRef.current = '2.5';
                difficultyLevelsRef.current = '';
            }

            // Reset flags and errors
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

        const restTime = parseInt(restTimeRef.current);
        if (isNaN(restTime) || restTime < 0) {
            newErrors.restTime = 'Valid rest time (seconds) required';
            isValid = false;
        }

        if (resistanceType === ResistanceType.WEIGHT) {
            if (currentWeightRef.current && isNaN(parseFloat(currentWeightRef.current))) {
                newErrors.currentWeight = 'Must be a valid number';
                isValid = false;
            }
            if (weightFactorRef.current && isNaN(parseFloat(weightFactorRef.current))) {
                newErrors.weightFactor = 'Must be a valid number';
                isValid = false;
            }
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
            const restTimeVal = parseInt(restTimeRef.current);
            await onSubmit({
                name: nameRef.current.trim(),
                description: descriptionRef.current,
                category,
                defaultTrackingType: trackingType,
                defaultResistanceType: resistanceType,
            }, {
                restTimeSeconds: isNaN(restTimeVal) ? 90 : restTimeVal,
                currentWeight: parseFloat(currentWeightRef.current) || 0,
                weightIncreaseFactor: parseFloat(weightFactorRef.current) || null,
                difficultyLevels: difficultyLevelsRef.current.split(',').map(s => s.trim()).filter(Boolean),
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

        const initRest = initialSettings?.restTimeSeconds?.toString() || '90';
        const initWeight = initialSettings?.currentWeight?.toString() || '0';
        const initFactor = initialSettings?.weightIncreaseFactor?.toString() || '2.5';
        const initDiff = initialSettings?.difficultyLevels?.join(', ') || '';

        const currName = nameRef.current;
        const currDesc = descriptionRef.current;
        const currCat = category;
        const currTrack = trackingType;
        const currResist = resistanceType;
        const currRest = restTimeRef.current;
        const currWeight = currentWeightRef.current;
        const currFactor = weightFactorRef.current;
        const currDiff = difficultyLevelsRef.current;

        if (currName !== initName) return true;
        if (currDesc !== initDesc) return true;
        if (currCat !== initCat) return true;
        if (currTrack !== initTrack) return true;
        if (currResist !== initResist) return true;
        if (currRest !== initRest) return true;

        if (resistanceType === ResistanceType.WEIGHT) {
            if (currWeight !== initWeight) return true;
            if (currFactor !== initFactor) return true;
        }
        if (resistanceType === ResistanceType.DIFFICULTY) {
            if (currDiff !== initDiff) return true;
        }

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
            setErrors, // needed for clearing errors on type
        },
        refs: {
            nameRef,
            descriptionRef,
            restTimeRef,
            currentWeightRef,
            weightFactorRef,
            difficultyLevelsRef,
        }
    };
};
