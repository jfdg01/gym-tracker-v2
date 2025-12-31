import { useState, useEffect, useRef } from 'react';
import { ProgramDayExercise, TrackingType, ResistanceType, Exercise, ExerciseSettings } from '@/src/types/domain';
import { ExerciseRepository } from '@/src/repositories/ExerciseRepository';

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
    
    // New fields
    const [difficultyLevels, setDifficultyLevels] = useState<string[]>([]);
    const [currentDifficulty, setCurrentDifficulty] = useState<string>('');

    const ignoreSaveRef = useRef(false);

    const setsRef = useRef('3');
    const targetRepsRef = useRef('12');
    const targetTimeRef = useRef('0');
    const restTimeRef = useRef('90');
    const currentWeightRef = useRef('0');
    const weightFactorRef = useRef('2.5');
    
    // Store original settings to check for changes
    const [originalSettings, setOriginalSettings] = useState<ExerciseSettings | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
             const exId = initialData?.exerciseId || selectedExercise?.id;
             if (!exId) return;

             // Fetch current settings
             const settings = await ExerciseRepository.getSettings(exId);
             setOriginalSettings(settings);

             if (initialData) {
                setTrackingType(initialData.trackingType);
                setResistanceType(initialData.resistanceType);
                setsRef.current = initialData.sets.toString();
                targetRepsRef.current = (initialData.targetReps || '0').toString();
                targetTimeRef.current = (initialData.targetTimeSeconds || '0').toString();
                
                // Prioritize value from ProgramDayExercise, fall back to Settings
                const r = initialData.restTimeSeconds ?? settings?.restTimeSeconds;
                restTimeRef.current = (r === null || r === undefined) ? '90' : r.toString();
                
                // Use settings for weight/difficulty visual
                currentWeightRef.current = (settings?.currentWeight || 0).toString();
                weightFactorRef.current = (settings?.weightIncreaseFactor || 2.5).toString();
                setDifficultyLevels(settings?.difficultyLevels || []);
                setCurrentDifficulty(settings?.currentDifficultyLevel || '');
            } else if (selectedExercise) {
                setTrackingType(selectedExercise.defaultTrackingType);
                setResistanceType(selectedExercise.defaultResistanceType);
                setsRef.current = '3';
                targetRepsRef.current = '12';
                targetTimeRef.current = '0';
                
                // Use settings
                restTimeRef.current = (settings?.restTimeSeconds || 90).toString();
                currentWeightRef.current = (settings?.currentWeight || 0).toString();
                weightFactorRef.current = (settings?.weightIncreaseFactor || 2.5).toString();
                setDifficultyLevels(settings?.difficultyLevels || []);
                setCurrentDifficulty(settings?.currentDifficultyLevel || '');
            } else {
                // Reset defaults
                setsRef.current = '3';
                targetRepsRef.current = '12';
                targetTimeRef.current = '0';
                restTimeRef.current = '90';
                currentWeightRef.current = '0';
                weightFactorRef.current = '2.5';
                setDifficultyLevels([]);
                setCurrentDifficulty('');
            }
             
             ignoreSaveRef.current = false;
             setFormKey(prev => prev + 1);
        };
        
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen, initialData, selectedExercise]);

    const saveChanges = async (silent: boolean = false) => {
        if (!silent) setLoading(true);
        try {
            const restVal = parseInt(restTimeRef.current);

            const data: Partial<ProgramDayExercise> = {
                trackingType,
                resistanceType,
                sets: parseInt(setsRef.current) || 0,
                targetReps: trackingType === TrackingType.REPS ? parseInt(targetRepsRef.current) : null,
                targetTimeSeconds: trackingType === TrackingType.TIME ? parseInt(targetTimeRef.current) : null,
                restTimeSeconds: isNaN(restVal) ? 90 : restVal,
            };
            
            // Update Settings if changed
            const exId = initialData?.exerciseId || selectedExercise?.id;
            if (exId) {
                const updates: Partial<ExerciseSettings> = {};
                if (resistanceType === ResistanceType.WEIGHT) {
                    const w = parseFloat(currentWeightRef.current);
                    if (!isNaN(w) && w !== originalSettings?.currentWeight) {
                        updates.currentWeight = w;
                    }
                    const f = parseFloat(weightFactorRef.current);
                    if (!isNaN(f) && f !== originalSettings?.weightIncreaseFactor) {
                        updates.weightIncreaseFactor = f;
                    }
                } else if (resistanceType === ResistanceType.DIFFICULTY) {
                    if (currentDifficulty && currentDifficulty !== originalSettings?.currentDifficultyLevel) {
                         updates.currentDifficultyLevel = currentDifficulty;
                    }
                    if (JSON.stringify(difficultyLevels) !== JSON.stringify(originalSettings?.difficultyLevels)) {
                        updates.difficultyLevels = difficultyLevels;
                    }
                }
                
                 // Save current rest time as default for next time
                 if (!isNaN(restVal) && restVal !== originalSettings?.restTimeSeconds) {
                     updates.restTimeSeconds = restVal;
                 }

                if (Object.keys(updates).length > 0) {
                    await ExerciseRepository.updateSettings(exId, updates);
                }
            }
            
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
            restTimeRef,
            currentWeightRef,
            weightFactorRef,
        },
        // Exposed state for difficulty UI
        difficultyState: {
             difficultyLevels,
             setDifficultyLevels,
             currentDifficulty,
             setCurrentDifficulty,
        }
    };
};
