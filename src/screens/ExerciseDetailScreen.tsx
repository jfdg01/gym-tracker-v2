
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Icon } from '@/components/ui/icon';
import { PencilIcon, CheckIcon, XIcon, DumbbellIcon, ClockIcon, ActivityIcon, FileTextIcon, FolderIcon, Trash2Icon } from 'lucide-react-native';
import { AppHeader } from '@/src/components/ui-library/AppHeader';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppFormField } from '@/src/components/ui-library/AppFormField';
import { AppInput } from '@/src/components/ui-library/AppInput';
import { AppSelect } from '@/src/components/ui-library/AppSelect';
import { AppTextarea } from '@/src/components/ui-library/AppTextarea';
import { AppDiscardDialog } from '@/src/components/ui-library/AppDiscardDialog';
import { StatusBadge } from '@/src/components/ui-library/StatusBadge';
import { AppAlert } from '@/src/components/ui-library/AppAlert';
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
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
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

    const handleDelete = async () => {
        try {
            await ExerciseService.archiveExercise(id);
            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="success" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Deleted</ToastTitle>
                            <ToastDescription>Exercise has been deleted</ToastDescription>
                        </VStack>
                    </Toast>
                )
            });
            router.back();
        } catch (e) {
            console.error(e);
            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="error" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Error</ToastTitle>
                            <ToastDescription>Failed to delete exercise</ToastDescription>
                        </VStack>
                    </Toast>
                )
            });
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
        },
        refs: {
            nameRef,
            descriptionRef,
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
                            
                            {/* Variable parameters (Rest, Weight, Difficulty) are now managed per-program */}
                        </VStack>

                        <AppButton
                            title="Delete Exercise"
                            variant="outline"
                            action="negative"
                            icon={Trash2Icon}
                            onPress={() => setShowDeleteAlert(true)}
                            className="mt-8 mb-4 border-error-500/30"
                        />
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

            <AppAlert
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                title="Delete Exercise"
                message={`Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`}
                buttons={[
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: handleDelete }
                ]}
            />
        </Box>
    );
};
