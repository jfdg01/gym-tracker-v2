
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Icon } from '@/components/ui/icon';
import { PencilIcon, CheckIcon, XIcon, DumbbellIcon, ClockIcon, ActivityIcon, FileTextIcon, FolderIcon } from 'lucide-react-native';
import { AppHeader } from '@/src/components/ui-library/AppHeader';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppFormField } from '@/src/components/ui-library/AppFormField';
import { AppInput } from '@/src/components/ui-library/AppInput';
import { AppSelect } from '@/src/components/ui-library/AppSelect';
import { AppTextarea } from '@/src/components/ui-library/AppTextarea';
import { AppDiscardDialog } from '@/src/components/ui-library/AppDiscardDialog';
import { StatusBadge } from '@/src/components/ui-library/StatusBadge';
import { ExerciseService } from '@/src/services/ExerciseService';
import { Exercise, ExerciseSettings, TrackingType, ResistanceType } from '@/src/types/domain';
import { useExerciseForm } from '@/src/hooks/useExerciseForm';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

interface ExerciseDetailScreenProps {
    id: string;
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

const trackingOptions = [
    { label: 'Reps', value: TrackingType.REPS },
    { label: 'Time', value: TrackingType.TIME },
];

const resistanceOptions = [
    { label: 'Weight', value: ResistanceType.WEIGHT },
    { label: 'Difficulty', value: ResistanceType.DIFFICULTY },
];

export const ExerciseDetailScreen = ({ id }: ExerciseDetailScreenProps) => {
    const router = useRouter();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [settings, setSettings] = useState<ExerciseSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newDifficulty, setNewDifficulty] = useState('');
    const toast = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const found = await ExerciseService.getExerciseById(id);

            if (found) {
                setExercise(found);
                const sett = await ExerciseService.getExerciseSettings(id);
                setSettings(sett);
            }
        } catch (e) {
            console.error(e);
            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="error" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Error</ToastTitle>
                            <ToastDescription>Failed to load exercise details</ToastDescription>
                        </VStack>
                    </Toast>
                )
            });
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async (data: Partial<Exercise>, newSettings: Partial<ExerciseSettings>) => {
        if (!exercise) return;

        try {
            await ExerciseService.updateExercise(exercise.id, {
                name: data.name,
                description: data.description,
                category: data.category,
                defaultTrackingType: data.defaultTrackingType,
                defaultResistanceType: data.defaultResistanceType,
            });

            await ExerciseService.updateExerciseSettings(exercise.id, newSettings);

            await loadData();

            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="success" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Success</ToastTitle>
                            <ToastDescription>Exercise updated successfully</ToastDescription>
                        </VStack>
                    </Toast>
                )
            });
        } catch (e) {
            console.error(e);
            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="error" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Error</ToastTitle>
                            <ToastDescription>Failed to save changes</ToastDescription>
                        </VStack>
                    </Toast>
                )
            });
            throw e;
        }
    };


    const {
        formState: {
            loading: saving,
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
            handleDiscardPress,
            confirmDiscard,
            setErrors,
            addDifficulty,
            removeDifficulty,
        },
        refs: {
            nameRef,
            descriptionRef,
            restTimeRef,
            currentWeightRef,
            weightFactorRef,
        }
    } = useExerciseForm({
        isOpen: isEditing,
        onClose: () => setIsEditing(false),
        onSubmit: handleSave,
        initialData: exercise,
        initialSettings: settings,
    });

    /** Stable callbacks for input changes to optimize performance. */
    const onNameChange = useCallback((t: string) => {
        nameRef.current = t;
        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
    }, [errors.name, setErrors]);

    const onRestChange = useCallback((t: string) => {
        restTimeRef.current = t;
        if (errors.restTime) setErrors(prev => ({ ...prev, restTime: '' }));
    }, [errors.restTime, setErrors]);

    const onWeightChange = useCallback((t: string) => {
        currentWeightRef.current = t;
        if (errors.currentWeight) setErrors(prev => ({ ...prev, currentWeight: '' }));
    }, [errors.currentWeight, setErrors]);

    const onFactorChange = useCallback((t: string) => {
        weightFactorRef.current = t;
        if (errors.weightFactor) setErrors(prev => ({ ...prev, weightFactor: '' }));
    }, [errors.weightFactor, setErrors]);

    const onDescriptionChange = useCallback((t: string) => {
        descriptionRef.current = t;
    }, []);


    if (loading) {
        return (
            <Box className="flex-1 bg-surface-deep justify-center items-center">
                <Text className="text-typography-500 font-medium">Loading...</Text>
            </Box>
        );
    }

    if (!exercise) {
        return (
            <Box className="flex-1 bg-surface-deep justify-center items-center p-6">
                <Text className="text-typography-400 text-center font-medium">Exercise not found.</Text>
                <AppButton
                    title="Go Back"
                    className="mt-4"
                    onPress={() => router.back()}
                />
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-surface-deep">
            <AppHeader
                title={isEditing ? "Edit Exercise" : "Exercise Details"}
                showBack={!isEditing}
                onBack={() => {
                    if (isEditing) handleDiscardPress();
                    else router.back();
                }}
                rightElement={
                    <AppButton
                        title={isEditing ? "Done" : "Edit"}
                        icon={isEditing ? CheckIcon : PencilIcon}
                        onPress={() => {
                            if (isEditing) {
                                handleManualSave();
                            } else {
                                setIsEditing(true);
                            }
                        }}
                        loading={saving}
                        variant="solid"
                        action="primary"
                        size="sm"
                        className="rounded-full"
                    />
                }
            />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {!isEditing ? (
                    <VStack space="lg" className="pb-20">
                        <AppCard className="p-5">
                            <VStack space="md">
                                <HStack className="justify-between items-start">
                                    <VStack className="flex-1 pr-4">
                                        <Text className="text-typography-950 font-heading text-2xl font-bold">{exercise.name}</Text>
                                        <Text className="text-typography-500 text-sm mt-1">{exercise.category || "Uncategorized"}</Text>
                                    </VStack>
                                    <Icon as={DumbbellIcon} size="xl" className="text-primary-energy/20" />
                                </HStack>

                                {exercise.description && (
                                    <VStack space="xs" className="mt-2 p-3 bg-surface-deep/50 rounded-lg">
                                        <HStack space="xs" className="items-center mb-1">
                                            <Icon as={FileTextIcon} size="xs" className="text-typography-500" />
                                            <Text className="text-typography-500 font-bold text-xs uppercase tracking-wider">Description</Text>
                                        </HStack>
                                        <Text className="text-typography-700 leading-relaxed">{exercise.description}</Text>
                                    </VStack>
                                )}
                            </VStack>
                        </AppCard>

                        <VStack space="md">
                            <Text className="text-typography-500 font-bold uppercase tracking-wider text-xs ml-1">Configuration</Text>

                            <HStack space="md">
                                <AppCard className="flex-1 p-4">
                                    <VStack space="xs" className="items-center">
                                        <Icon as={ActivityIcon} className="text-primary-energy mb-2" />
                                        <Text className="text-typography-500 text-xs font-bold uppercase">Tracking</Text>
                                        <Text className="text-typography-950 font-bold text-lg">{exercise.defaultTrackingType}</Text>
                                    </VStack>
                                </AppCard>
                                <AppCard className="flex-1 p-4">
                                    <VStack space="xs" className="items-center">
                                        <Icon as={DumbbellIcon} className="text-primary-energy mb-2" />
                                        <Text className="text-typography-500 text-xs font-bold uppercase">Resistance</Text>
                                        <Text className="text-typography-950 font-bold text-lg">{exercise.defaultResistanceType}</Text>
                                    </VStack>
                                </AppCard>
                            </HStack>

                            <AppCard className="p-0 overflow-hidden">
                                <VStack className="divide-y divide-white/5">
                                    <HStack className="p-4 justify-between items-center">
                                        <HStack space="sm" className="items-center">
                                            <Icon as={ClockIcon} size="sm" className="text-typography-500" />
                                            <Text className="text-typography-700">Rest Time</Text>
                                        </HStack>
                                        <Text className="text-typography-950 font-bold">{settings?.restTimeSeconds || 90}s</Text>
                                    </HStack>

                                    {exercise.defaultResistanceType === ResistanceType.WEIGHT && (
                                        <>
                                            <HStack className="p-4 justify-between items-center bg-surface-deep/30">
                                                <Text className="text-typography-700 ml-7">Current Weight</Text>
                                                <Text className="text-typography-950 font-bold">{settings?.currentWeight || 0} kg</Text>
                                            </HStack>
                                            <HStack className="p-4 justify-between items-center bg-surface-deep/30">
                                                <Text className="text-typography-700 ml-7">Increase Factor</Text>
                                                <Text className="text-typography-950 font-bold">{settings?.weightIncreaseFactor || 2.5} kg</Text>
                                            </HStack>
                                        </>
                                    )}

                                    {exercise.defaultResistanceType === ResistanceType.DIFFICULTY && (
                                        <VStack className="p-4 bg-surface-deep/30" space="md">
                                            <Text className="text-typography-700 ml-7">Difficulty Levels</Text>
                                            <VStack space="sm" className="ml-7">
                                                {settings?.difficultyLevels?.map((level, i) => (
                                                    <HStack key={i} space="sm" className="items-center">
                                                        <Box className="w-1.5 h-1.5 rounded-full bg-typography-400" />
                                                        <Text className="text-typography-900 font-medium">{level}</Text>
                                                    </HStack>
                                                ))}
                                                {(!settings?.difficultyLevels || settings.difficultyLevels.length === 0) && (
                                                    <Text className="text-typography-500 italic">None defined</Text>
                                                )}
                                            </VStack>
                                        </VStack>
                                    )}
                                </VStack>
                            </AppCard>
                        </VStack>

                    </VStack>
                ) : (
                    <VStack space="md" className="pb-20">
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

                        <AppFormField label="Rest Time (Seconds)" required error={errors.restTime}>
                            <AppInput
                                value={restTimeRef.current}
                                onChangeText={onRestChange}
                                placeholder="e.g. 90"
                                keyboardType="numeric"
                                isInvalid={!!errors.restTime}
                                key={`${formKey}-rest`}
                            />
                        </AppFormField>

                        {resistanceType === ResistanceType.WEIGHT && (
                            <HStack space="md" className="w-full">
                                <AppFormField label="Start Weight (kg)" error={errors.currentWeight} className="flex-1">
                                    <AppInput
                                        value={currentWeightRef.current}
                                        onChangeText={onWeightChange}
                                        placeholder="e.g. 20"
                                        keyboardType="numeric"
                                        isInvalid={!!errors.currentWeight}
                                        key={`${formKey}-weight`}
                                    />
                                </AppFormField>
                                <AppFormField label="Increase (kg)" error={errors.weightFactor} className="flex-1">
                                    <AppInput
                                        value={weightFactorRef.current}
                                        onChangeText={onFactorChange}
                                        placeholder="e.g. 2.5"
                                        keyboardType="numeric"
                                        isInvalid={!!errors.weightFactor}
                                        key={`${formKey}-factor`}
                                    />
                                </AppFormField>
                            </HStack>
                        )}

                        {resistanceType === ResistanceType.DIFFICULTY && (
                            <VStack space="sm" className="mt-2">
                                <Text className="text-typography-500 font-bold uppercase tracking-wider text-xs ml-1">Difficulty Levels</Text>
                                <AppCard className="p-4">
                                    <VStack space="md">
                                        <VStack space="xs" className="divide-y divide-white/5">
                                            {difficultyLevels.map((level, index) => (
                                                <HStack key={index} className="justify-between items-center py-2">
                                                    <Text className="text-typography-900 font-medium">{level}</Text>
                                                    <Pressable
                                                        onPress={() => removeDifficulty(index)}
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
                                                        addDifficulty(newDifficulty);
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
                                    </VStack>
                                </AppCard>
                            </VStack>
                        )}

                        <AppFormField label="Description">
                            <AppTextarea
                                value={descriptionRef.current}
                                onChangeText={onDescriptionChange}
                                placeholder="Optional notes..."
                                key={`${formKey}-desc`}
                            />
                        </AppFormField>

                        <AppButton
                            title="Cancel Changes"
                            variant="outline"
                            action="negative"
                            onPress={handleDiscardPress}
                            className="mt-4"
                        />
                    </VStack>
                )}
            </ScrollView>

            <AppDiscardDialog
                isOpen={showDiscardAlert}
                onClose={() => setShowDiscardAlert(false)}
                onConfirm={confirmDiscard}
            />
        </Box>
    );
};
