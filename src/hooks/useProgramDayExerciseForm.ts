import { useState, useEffect, useRef } from 'react';
import { ProgramDayExercise, TrackingType, ResistanceType, Exercise } from '@/src/types/domain';

interface UseProgramDayExerciseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<ProgramDayExercise>) => Promise<void>;
    initialData?: ProgramDayExercise | null;
    selectedExercise?: Exercise | null;
}

export const useProgramDayExerciseForm = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    selectedExercise
}: UseProgramDayExerciseFormProps) => {
    const [loading, setLoading] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [trackingType, setTrackingType] = useState<TrackingType>(TrackingType.REPS);
    const [resistanceType, setResistanceType] = useState<ResistanceType>(ResistanceType.WEIGHT);
    const [showDiscardAlert, setShowDiscardAlert] = useState(false);
    const ignoreSaveRef = useRef(false);

    const setsRef = useRef('3');
    const targetRepsRef = useRef('0');
    const targetTimeRef = useRef('0');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTrackingType(initialData.trackingType);
                setResistanceType(initialData.resistanceType);
                setsRef.current = initialData.sets.toString();
                targetRepsRef.current = (initialData.targetReps || '0').toString();
                targetTimeRef.current = (initialData.targetTimeSeconds || '0').toString();
            } else if (selectedExercise) {
                setTrackingType(selectedExercise.defaultTrackingType);
                setResistanceType(selectedExercise.defaultResistanceType);
                setsRef.current = '3';
                targetRepsRef.current = '0';
                targetTimeRef.current = '0';
            }
            ignoreSaveRef.current = false;
            setFormKey(prev => prev + 1);
        }
    }, [isOpen, initialData, selectedExercise]);

    const saveChanges = async (silent: boolean = false) => {
        if (!silent) setLoading(true);
        try {
            const data: Partial<ProgramDayExercise> = {
                trackingType,
                resistanceType,
                sets: parseInt(setsRef.current) || 0,
                targetReps: trackingType === TrackingType.REPS ? parseInt(targetRepsRef.current) : null,
                targetTimeSeconds: trackingType === TrackingType.TIME ? parseInt(targetTimeRef.current) : null,
            };
            await onSubmit(data);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            if (!silent) setLoading(false);
        }
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

    return {
        formState: {
            loading,
            formKey,
            trackingType,
            resistanceType,
            showDiscardAlert,
        },
        actions: {
            setShowDiscardAlert,
            handleManualSave,
            handleSheetClose,
        },
        refs: {
            setsRef,
            targetRepsRef,
            targetTimeRef,
        }
    };
};
