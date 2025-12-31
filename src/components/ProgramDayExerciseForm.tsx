import React, { useCallback } from 'react';
import { ProgramDayExercise, TrackingType, ResistanceType, Exercise } from '@/src/types/domain';
import { useProgramDayExerciseForm } from '@/src/hooks/useProgramDayExerciseForm';
import { AppFormSheet } from './ui-library/AppFormSheet';
import { AppFormField } from './ui-library/AppFormField';
import { AppSelect } from './ui-library/AppSelect';
import { AppButton } from './ui-library/AppButton';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Pressable } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { XIcon, TrashIcon } from 'lucide-react-native';
import { AppInput } from './ui-library/AppInput';
import { AppCard } from './ui-library/AppCard';

interface ProgramDayExerciseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<ProgramDayExercise>) => Promise<void>;
    initialData?: ProgramDayExercise | null;
    selectedExercise?: Exercise | null;
    onDelete?: () => void;
}

export const ProgramDayExerciseForm = (props: ProgramDayExerciseFormProps) => {
    const { isOpen, initialData, selectedExercise, onDelete } = props;
    const {
        formState: {
            loading,
            formKey,
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
            restTimeRef,
            currentWeightRef,
            weightFactorRef,
        },
        difficultyState: {
            difficultyLevels,
            setDifficultyLevels,
            currentDifficulty,
            setCurrentDifficulty,
        }
    } = useProgramDayExerciseForm(props);

    // Stable callbacks for Hybrid Ref Pattern
    const onSetsChange = useCallback((t: string) => { setsRef.current = t; }, []);
    const onRepsChange = useCallback((t: string) => { targetRepsRef.current = t; }, []);
    const onTimeChange = useCallback((t: string) => { targetTimeRef.current = t; }, []);
    const onRestChange = useCallback((t: string) => { restTimeRef.current = t; }, []);
    const onWeightChange = useCallback((t: string) => { currentWeightRef.current = t; }, []);
    const onFactorChange = useCallback((t: string) => { weightFactorRef.current = t; }, []);

    const [newDifficulty, setNewDifficulty] = React.useState('');
    const deleteButton = initialData && onDelete ? (
        <AppButton
            variant="solid" 
            action="negative"
            size="sm"
            onPress={onDelete}
            icon={TrashIcon}
            className="w-10 h-10 rounded-full bg-error-500/10 active:bg-error-500/20 p-2"
            title=""
        />
    ) : null;

    return (
        <AppFormSheet
            isOpen={isOpen}
            onClose={handleSheetClose}
            title={initialData ? 'Edit Exercise' : 'Add Exercise'}
            subTitle={selectedExercise?.name || ''}
            headerRight={deleteButton}
        >
            <HStack space="md" className="w-full">
                <AppFormField label="Sets" className="flex-1">
                    <AppInput
                        value={setsRef.current}
                        onChangeText={onSetsChange}
                        placeholder="Number of sets"
                        keyboardType="numeric"
                        key={`${formKey}-sets`}
                    />
                </AppFormField>

                {trackingType === TrackingType.REPS ? (
                    <AppFormField label="Target Reps" className="flex-1">
                        <AppInput
                            value={targetRepsRef.current}
                            onChangeText={onRepsChange}
                            placeholder="e.g. 10"
                            keyboardType="numeric"
                            key={`${formKey}-reps`}
                        />
                    </AppFormField>
                ) : (
                    <AppFormField label="Target Time (s)" className="flex-1">
                        <AppInput
                            value={targetTimeRef.current}
                            onChangeText={onTimeChange}
                            placeholder="e.g. 60"
                            keyboardType="numeric"
                            key={`${formKey}-time`}
                        />
                    </AppFormField>
                )}
            </HStack>

            <AppFormField label="Rest Time (Seconds)">
                <AppInput
                    value={restTimeRef.current}
                    onChangeText={onRestChange}
                    placeholder="e.g. 90"
                    keyboardType="numeric"
                    key={`${formKey}-rest`}
                />
            </AppFormField>

            {resistanceType === ResistanceType.WEIGHT && (
                <HStack space="md" className="w-full">
                    <AppFormField label="Initial Weight (kg)" className="flex-1">
                        <AppInput
                            value={currentWeightRef.current}
                            onChangeText={onWeightChange}
                            placeholder="e.g. 20"
                            keyboardType="numeric"
                            key={`${formKey}-weight`}
                        />
                    </AppFormField>
                     <AppFormField label="Increase (kg)" className="flex-1">
                        <AppInput
                            value={weightFactorRef.current}
                            onChangeText={onFactorChange}
                            placeholder="e.g. 2.5"
                            keyboardType="numeric"
                            key={`${formKey}-factor`}
                        />
                    </AppFormField>
                </HStack>
            )}

            {resistanceType === ResistanceType.DIFFICULTY && (
                 <AppFormField label="Difficulty Levels (Updates Global Settings)">
                    <AppCard className="p-4">
                        <VStack space="md">
                             <VStack space="xs" className="divide-y divide-white/5">
                                {difficultyLevels.map((level, index) => (
                                    <HStack key={index} className="justify-between items-center py-2">
                                        <Text className="text-typography-900 font-medium">{level}</Text>
                                        <Pressable
                                            onPress={() => setDifficultyLevels(prev => prev.filter((_, i) => i !== index))}
                                            className="p-2 opacity-70 active:opacity-100"
                                        >
                                            <Icon as={XIcon} size="xs" className="text-error-500" />
                                        </Pressable>
                                    </HStack>
                                ))}
                                {difficultyLevels.length === 0 && (
                                    <Text className="text-typography-500 italic py-2">No levels defined</Text>
                                )}
                            </VStack>

                            <HStack space="sm" className="items-center mt-2">
                                <AppInput
                                    value={newDifficulty}
                                    onChangeText={setNewDifficulty}
                                    placeholder="Add difficulty (e.g. Red)"
                                    className="flex-1 h-10"
                                    inputClassName="text-sm"
                                />
                                <AppButton
                                    title="Add"
                                    onPress={() => {
                                        if (newDifficulty.trim()) {
                                            setDifficultyLevels(prev => [...prev, newDifficulty.trim()]);
                                            setNewDifficulty('');
                                        }
                                    }}
                                    size="sm"
                                    variant="outline"
                                    action="primary"
                                    className="h-10"
                                    disabled={!newDifficulty.trim()}
                                />
                            </HStack>
                             
                             <Text size="xs" className="text-typography-400 mt-2">
                                 Current Level:
                             </Text>
                             <AppSelect
                                value={currentDifficulty}
                                onValueChange={setCurrentDifficulty}
                                options={difficultyLevels.map(l => ({ label: l, value: l }))}
                                placeholder="Select starting level"
                            />
                        </VStack>
                    </AppCard>
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
