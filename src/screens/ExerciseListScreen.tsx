import React, { useCallback, useState, useEffect } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Fab, FabIcon } from '@/components/ui/fab';
import { Icon } from '@/components/ui/icon';
import { PlusIcon, Trash2Icon } from 'lucide-react-native';
import { ExerciseService } from '@/src/services/ExerciseService';
import { Exercise, ExerciseSettings } from '@/src/types/domain';
import { ExerciseForm } from '@/src/components/ExerciseForm';
import { SearchBar } from '@/src/components/SearchBar';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppScreenTitle } from '@/src/components/ui-library/AppScreenTitle';
import { StatusBadge } from '@/src/components/ui-library/StatusBadge';

export const ExerciseListScreen = () => {
    const router = useRouter();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [editingSettings, setEditingSettings] = useState<ExerciseSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    const showToast = (title: string, description: string, action: 'success' | 'error' = 'success') => {
        toast.show({
            id: 'gym-tracker-toast',
            placement: 'top',
            render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                    <Toast nativeID={toastId} action={action} variant="outline">
                        <VStack space="xs">
                            <ToastTitle>{title}</ToastTitle>
                            <ToastDescription>{description}</ToastDescription>
                        </VStack>
                    </Toast>
                )
            },
        })
    }

    const loadExercises = async () => {
        setLoading(true);
        try {
            const data = await ExerciseService.getAllExercises();
            setExercises(data);
            setFilteredExercises(data);
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to load exercises", "error");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadExercises();
        }, [])
    );

    const [isPending, startTransition] = React.useTransition();

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredExercises(exercises);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            startTransition(() => {
                const filtered = exercises.filter(
                    (ex) =>
                        ex.name.toLowerCase().includes(lowerQuery) ||
                        (ex.category && ex.category.toLowerCase().includes(lowerQuery))
                );
                setFilteredExercises(filtered);
            });
        }
    }, [searchQuery, exercises]);

    const handleCreateOrUpdate = async (data: Partial<Exercise>, settings: Partial<ExerciseSettings>) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            let targetId = editingExercise?.id;
            let isUpdate = !!editingExercise;

            if (editingExercise) {
                // Update
                await ExerciseService.updateExercise(editingExercise.id, {
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    defaultTrackingType: data.defaultTrackingType,
                    defaultResistanceType: data.defaultResistanceType,
                });
            } else {
                // Create
                const newEx = await ExerciseService.createExercise({
                    name: data.name!,
                    description: data.description || null,
                    category: data.category || 'Strength',
                    defaultTrackingType: data.defaultTrackingType!,
                    defaultResistanceType: data.defaultResistanceType!,
                });
                targetId = newEx.id;
            }

            // Save Settings (for both Create and Update)
            if (targetId) {
                await ExerciseService.updateExerciseSettings(targetId, settings);
            }

            await loadExercises();
            setShowForm(false);
            setEditingExercise(null);
            setEditingSettings(null);
            setSearchQuery('');
            if (!isUpdate) {
                showToast("Success", "Exercise created successfully");
            }
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to save exercise", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleArchive = async (id: string) => {
        try {
            await ExerciseService.archiveExercise(id);
            await loadExercises();
            showToast("Archived", "Exercise has been archived");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to archive exercise", "error");
        }
    };

    const openEdit = async (exercise: Exercise) => {
        setEditingExercise(exercise);
        try {
            const settings = await ExerciseService.getExerciseSettings(exercise.id);
            setEditingSettings(settings);
        } catch (e) {
            console.error("Failed to load settings", e);
        }
        setShowForm(true);
    };

    const openCreate = () => {
        setEditingExercise(null);
        setEditingSettings(null);
        setShowForm(true);
    };

    return (
        <Box className="flex-1 bg-surface-deep">
            <VStack space="md" className="flex-1 px-4 pt-12">
                <AppScreenTitle title="Exercises" />
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search exercises..."
                />

                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadExercises} tintColor="#fff" />
                    }
                >
                    <VStack space="sm" className="pb-24 pt-2">
                        {filteredExercises.length === 0 ? (
                            <Text className="text-typography-500 text-center mt-4">No exercises found.</Text>
                        ) : (
                            filteredExercises.map((ex) => (
                                <Pressable
                                    key={ex.id}
                                    onPress={() => router.push(`/exercises/${ex.id}`)}
                                    android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}
                                    className="active:opacity-80"
                                >
                                    <AppCard className="p-4 mb-1">
                                        <HStack className="justify-between items-center">
                                            <VStack space="xs" className="flex-1">
                                                <Text className="text-white font-bold text-lg">{ex.name}</Text>
                                                <HStack space="sm" className="mt-1">
                                                    <StatusBadge
                                                        label={ex.category || 'Uncategorized'}
                                                        variant="neutral"
                                                    />
                                                    <StatusBadge
                                                        label={ex.defaultTrackingType}
                                                        variant="primary"
                                                    />
                                                </HStack>
                                            </VStack>

                                            <VStack space="sm">
                                                <AppButton
                                                    title="Archive"
                                                    size="sm"
                                                    variant="outline"
                                                    action="negative"
                                                    icon={Trash2Icon}
                                                    onPress={() => handleArchive(ex.id)}
                                                    className="h-9 px-3"
                                                />
                                            </VStack>
                                        </HStack>
                                    </AppCard>
                                </Pressable>
                            ))
                        )}
                    </VStack>
                </ScrollView>
            </VStack>

            <Fab
                size="lg"
                placement="bottom right"
                onPress={openCreate}
                className="bg-primary-energy shadow-xl"
                disabled={isSaving}
            >
                <FabIcon as={PlusIcon} />
            </Fab>

            <ExerciseForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreateOrUpdate}
                initialData={editingExercise}
                initialSettings={editingSettings}
            />
        </Box>
    );
};
