import React, { useCallback, useState, useEffect } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { cn } from '@/src/utils/cn';
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
import { PlusIcon, Trash2Icon, DumbbellIcon, ChevronRightIcon, TimerIcon, ZapIcon, ClockIcon, ActivityIcon } from 'lucide-react-native';
import { ExerciseService } from '@/src/services/ExerciseService';
import { Exercise, ExerciseSettings, ResistanceType, TrackingType } from '@/src/types/domain';
import { ExerciseForm } from '@/src/components/ExerciseForm';
import { SearchBar } from '@/src/components/SearchBar';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppScreenTitle } from '@/src/components/ui-library/AppScreenTitle';
import { StatusBadge } from '@/src/components/ui-library/StatusBadge';
import { StaggeredItem } from '@/src/components/ui-library/StaggeredItem';

const getExerciseStyles = (exercise: Exercise) => {
    const resistance = exercise.defaultResistanceType;
    const tracking = exercise.defaultTrackingType;

    let icon = ActivityIcon;
    let colorClass = "text-slate-500";
    let bgClass = "bg-slate-500/10 border-slate-500/20";
    let borderColor = "border-l-slate-500";

    if (resistance === ResistanceType.WEIGHT && tracking === TrackingType.REPS) {
        icon = DumbbellIcon;
        colorClass = "text-indigo-400";
        bgClass = "bg-indigo-400/10 border-indigo-400/20";
        borderColor = "border-l-indigo-500";
    } else if (resistance === ResistanceType.WEIGHT && tracking === TrackingType.TIME) {
        icon = TimerIcon;
        colorClass = "text-amber-400";
        bgClass = "bg-amber-400/10 border-amber-400/20";
        borderColor = "border-l-amber-500";
    } else if (resistance === ResistanceType.DIFFICULTY && tracking === TrackingType.REPS) {
        icon = ZapIcon;
        colorClass = "text-purple-400";
        bgClass = "bg-purple-400/10 border-purple-400/20";
        borderColor = "border-l-purple-500";
    } else if (resistance === ResistanceType.DIFFICULTY && tracking === TrackingType.TIME) {
        icon = ClockIcon;
        colorClass = "text-teal-400";
        bgClass = "bg-teal-400/10 border-teal-400/20";
        borderColor = "border-l-teal-500";
    }

    return { icon, colorClass, bgClass, borderColor };
};

const ExerciseBadge = ({ exercise }: { exercise: Exercise }) => {
    const { colorClass, bgClass } = getExerciseStyles(exercise);

    return (
        <HStack space="xs">
            <Box
                className={cn(
                    "px-2 py-0.5 rounded-full border items-center justify-center self-start",
                    bgClass
                )}
            >
                <Text className={cn("text-[10px] font-bold uppercase tracking-wider", colorClass)}>
                    {exercise.defaultResistanceType}
                </Text>
            </Box>
            <Box
                className={cn(
                    "px-2 py-0.5 rounded-full border items-center justify-center self-start",
                    bgClass
                )}
            >
                <Text className={cn("text-[10px] font-bold uppercase tracking-wider", colorClass)}>
                    {exercise.defaultTrackingType}
                </Text>
            </Box>
        </HStack>
    );
};

export const ExerciseListScreen = () => {
    const router = useRouter();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
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

    const onRefresh = async () => {
        setRefreshing(true);
        await loadExercises();
        setRefreshing(false);
    };

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

                await ExerciseService.updateExercise(editingExercise.id, {
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    defaultTrackingType: data.defaultTrackingType,
                    defaultResistanceType: data.defaultResistanceType,
                });
            } else {

                const newEx = await ExerciseService.createExercise({
                    name: data.name!,
                    description: data.description || null,
                    category: data.category || 'Strength',
                    defaultTrackingType: data.defaultTrackingType!,
                    defaultResistanceType: data.defaultResistanceType!,
                });
                targetId = newEx.id;
            }


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
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                >
                    <VStack space="sm" className="pb-24 pt-2">
                        {filteredExercises.length === 0 ? (
                            <Text className="text-typography-500 text-center mt-4">No exercises found.</Text>
                        ) : (
                            filteredExercises.map((ex, index) => (
                                <StaggeredItem
                                    key={ex.id}
                                    index={index}
                                >
                                    <Pressable
                                        onPress={() => router.push(`/exercises/${ex.id}`)}
                                        android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}
                                        className="active:opacity-80"
                                    >
                                        <AppCard
                                            className={cn(
                                                "p-4 mb-3 border-l-4",
                                                getExerciseStyles(ex).borderColor
                                            )}
                                        >
                                            <HStack className="justify-between items-center">
                                                <VStack space="sm" className="flex-1">
                                                    <HStack space="xs" className="items-center">
                                                        <Icon
                                                            as={getExerciseStyles(ex).icon}
                                                            size="sm"
                                                            className={getExerciseStyles(ex).colorClass}
                                                        />
                                                        <Text className="text-white font-bold text-lg">{ex.name}</Text>
                                                    </HStack>

                                                    <HStack space="sm" className="mt-1">
                                                        <ExerciseBadge exercise={ex} />
                                                    </HStack>
                                                </VStack>

                                                <Box
                                                    className="p-2 rounded-full"
                                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                                >
                                                    <Icon as={ChevronRightIcon} size="sm" className="text-typography-400" />
                                                </Box>
                                            </HStack>
                                        </AppCard>
                                    </Pressable>
                                </StaggeredItem>
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
