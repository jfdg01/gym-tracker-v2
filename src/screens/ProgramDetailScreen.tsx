import React, { useEffect, useState, useCallback } from 'react';
import { RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Input, InputField } from '@/components/ui/input';
import { AppHeader } from '@/src/components/ui-library/AppHeader';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppAlert } from '@/src/components/ui-library/AppAlert';
import {
    ChevronLeftIcon,
    PlusIcon,
    MoreVerticalIcon,
    TrashIcon,
    EditIcon,
    DumbbellIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    MoonIcon,
    CoffeeIcon,
    PlayIcon
} from 'lucide-react-native';
import { useWorkout } from '@/src/hooks/useWorkout';
import { ProgramService } from '@/src/services/ProgramService';
import { ProgramDayService } from '@/src/services/ProgramDayService';
import { ProgramDayExerciseService } from '@/src/services/ProgramDayExerciseService';
import { ExerciseService } from '@/src/services/ExerciseService';
import { Program, ProgramDay, ProgramDayExercise, Exercise, ResistanceType, TrackingType } from '@/src/types/domain';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { ExerciseSelector } from '@/src/components/ExerciseSelector';
import { ProgramDayExerciseForm } from '@/src/components/ProgramDayExerciseForm';
import { RenameProgramDayDialog } from '@/src/components/RenameProgramDayDialog';

interface ProgramDetailScreenProps {
    id: string;
}

interface DayWithExercises extends ProgramDay {
    exercises: (ProgramDayExercise & { exercise?: Exercise })[];
}

export const ProgramDetailScreen = ({ id }: ProgramDetailScreenProps) => {
    const router = useRouter();
    const [program, setProgram] = useState<Program | null>(null);
    const [days, setDays] = useState<DayWithExercises[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [selectorOpen, setSelectorOpen] = useState(false);
    const [exerciseFormOpen, setExerciseFormOpen] = useState(false);
    const [activeDayId, setActiveDayId] = useState<string | null>(null);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [editingDayEx, setEditingDayEx] = useState<ProgramDayExercise | null>(null);
    const [dayToDeleteId, setDayToDeleteId] = useState<string | null>(null);

    const { activeSession, startWorkout } = useWorkout();
    const [showActiveSessionAlert, setShowActiveSessionAlert] = useState(false);
    const [showDeleteDayAlert, setShowDeleteDayAlert] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renamingDayId, setRenamingDayId] = useState<string | null>(null);

    const toast = useToast();

    const showToast = (title: string, description: string, action: 'success' | 'error' = 'success') => {
        toast.show({
            id: 'program-status-toast',
            placement: 'top',
            render: ({ id }) => (
                <Toast nativeID={"toast-" + id} action={action} variant="outline">
                    <VStack space="xs">
                        <ToastTitle>{title}</ToastTitle>
                        <ToastDescription>{description}</ToastDescription>
                    </VStack>
                </Toast>
            ),
        });
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const p = await ProgramService.getProgramById(id);
            if (!p) {
                showToast("Error", "Program not found", "error");
                router.back();
                return;
            }
            setProgram(p);

            const programDays = await ProgramDayService.getDaysByProgramId(id);
            const daysWithEx: DayWithExercises[] = [];

            for (const day of programDays) {
                const dayExercises = await ProgramDayExerciseService.getExercisesByDayId(day.id);
                const enrichedExercises = await Promise.all(
                    dayExercises.map(async (de) => {
                        const ex = await ExerciseService.getExerciseById(de.exerciseId);
                        return { ...de, exercise: ex || undefined };
                    })
                );
                daysWithEx.push({ ...day, exercises: enrichedExercises });
            }

            setDays(daysWithEx);
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to load program details", "error");
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddDay = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const nextDayNumber = days.length + 1;
            await ProgramDayService.createDay(id, `Day ${nextDayNumber}`);
            await loadData();
            showToast("Success", "Day added");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to add day", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDay = async (dayId: string) => {
        setDayToDeleteId(dayId);
        setShowDeleteDayAlert(true);
    };

    const confirmDeleteDay = async () => {
        if (!dayToDeleteId || submitting) return;
        setSubmitting(true);
        try {
            await ProgramDayService.deleteDay(dayToDeleteId);
            await loadData();
            showToast("Success", "Day deleted");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to delete day", "error");
        } finally {
            setSubmitting(false);
            setShowDeleteDayAlert(false);
            setDayToDeleteId(null);
        }
    };

    const handleOpenSelector = (dayId: string) => {
        setActiveDayId(dayId);
        setSelectorOpen(true);
    };

    const handleExerciseSelected = (ex: Exercise) => {
        setSelectedExercise(ex);
        setSelectorOpen(false);
        setEditingDayEx(null);
        setExerciseFormOpen(true);
    };

    const handleEditExercise = (de: ProgramDayExercise, ex?: Exercise) => {
        setEditingDayEx(de);
        setSelectedExercise(ex || null);
        setExerciseFormOpen(true);
    };

    const handleExerciseFormSubmit = async (data: Partial<ProgramDayExercise>) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            if (editingDayEx) {
                await ProgramDayExerciseService.updateExerciseInDay(editingDayEx.id, data);
                showToast("Updated", "Exercise updated");
            } else if (activeDayId && selectedExercise) {
                await ProgramDayExerciseService.addExerciseToDay({
                    programDayId: activeDayId,
                    exerciseId: selectedExercise.id,
                    trackingType: data.trackingType!,
                    resistanceType: data.resistanceType!,
                    sets: data.sets!,
                    targetReps: data.targetReps || null,
                    targetTimeSeconds: data.targetTimeSeconds || null,
                });
                showToast("Added", "Exercise added to day");
            }
            await loadData();
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to save exercise", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteExercise = async (id: string) => {
        try {
            await ProgramDayExerciseService.removeExerciseFromDay(id);
            await loadData();
            showToast("Deleted", "Exercise removed");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to remove exercise", "error");
        }
    };

    const handleToggleRestDay = async (dayId: string, currentStatus: boolean) => {
        try {
            await ProgramDayService.updateDay(dayId, { isRestDay: !currentStatus });
            await loadData();
            showToast("Success", !currentStatus ? "Marked as Rest Day" : "Marked as Workout Day");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to update day", "error");
        }
    };

    const handleRenameDay = async (newName: string) => {
        if (!renamingDayId || submitting) return;
        setSubmitting(true);
        try {
            await ProgramDayService.updateDay(renamingDayId, { name: newName });
            await loadData();
            showToast("Success", "Day renamed");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to rename day", "error");
        } finally {
            setSubmitting(false);
            setIsRenameModalOpen(false);
            setRenamingDayId(null);
        }
    };

    if (!program && loading) {
        return (
            <Box className="flex-1 bg-surface-deep justify-center items-center">
                <Text className="text-typography-500 font-medium font-body">Loading...</Text>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-surface-deep">
            <AppHeader
                title={program?.name || 'Program Details'}
                subTitle={program?.description || undefined}
                showBack={true}
            />

            <ScrollView
                className="flex-1 px-4"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#fff" />}
            >
                <VStack space="lg" className="py-6 pb-24">
                    {days.length === 0 ? (
                        <VStack space="md" className="items-center justify-center py-20">
                            <Text className="text-typography-500">No days added to this program yet.</Text>
                            <AppButton
                                title="Add First Day"
                                onPress={handleAddDay}
                                size="sm"
                                variant="outline"
                                className="w-auto px-6 h-10"
                            />
                        </VStack>
                    ) : (
                        days.sort((a, b) => a.orderIndex - b.orderIndex).map((day) => (
                            <VStack key={day.id} space="md" className="mb-4">
                                <HStack className="justify-between items-center mb-4 px-1">
                                    <Pressable
                                        onPress={() => {
                                            setRenamingDayId(day.id);
                                            setIsRenameModalOpen(true);
                                        }}
                                        className="flex-1 active:opacity-60"
                                    >
                                        <HStack space="xs" className="items-center">
                                            <Heading size="lg" className={`${day.isRestDay ? 'text-typography-400' : 'text-primary-energy'} italic font-heading`}>
                                                {day.name.toUpperCase()} {day.isRestDay && '(REST)'}
                                            </Heading>
                                            <Icon as={EditIcon} size="md" className="text-primary-energy/40 ml-1" />
                                        </HStack>
                                    </Pressable>
                                    <HStack space="sm">
                                        <AppButton
                                            title={day.isRestDay ? 'Workout' : 'Rest'}
                                            size="sm"
                                            variant="outline"
                                            icon={day.isRestDay ? DumbbellIcon : MoonIcon}
                                            onPress={() => handleToggleRestDay(day.id, !!day.isRestDay)}
                                            className="w-15 h-9 border border-neutral-600 text-neutral-600"
                                        />
                                        <AppButton
                                            title="Delete"
                                            size="sm"
                                            variant="solid"
                                            action="negative"
                                            icon={TrashIcon}
                                            onPress={() => handleDeleteDay(day.id)}
                                            className="w-15 h-9"
                                        />
                                    </HStack>
                                </HStack>

                                <AppCard
                                    className="p-0 overflow-hidden rounded-2xl border-0"
                                    style={{
                                        elevation: 2,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        borderColor: 'rgba(255, 255, 255, 0.05)'
                                    }}
                                >
                                    {day.isRestDay ? (
                                        <VStack className="p-10 items-center justify-center" style={{ backgroundColor: 'rgba(24, 23, 25, 0.1)' }}>
                                            <Icon as={CoffeeIcon} size="xl" className="text-typography-300 mb-2" />
                                            <Text className="text-typography-400 font-bold uppercase tracking-widest text-xs">Rest & Recovery</Text>
                                            <Text size="xs" className="text-typography-500 text-center mt-2 font-medium">Take it easy today to let your muscles grow.</Text>
                                        </VStack>
                                    ) : (
                                        <VStack>
                                            {day.exercises.length === 0 ? (
                                                <Pressable
                                                    className="p-8 items-center justify-center border-b border-outline-dark border-dashed"
                                                    onPress={() => handleOpenSelector(day.id)}
                                                >
                                                    <Icon as={PlusIcon} size="md" className="text-typography-400 mb-2" />
                                                    <Text size="sm" className="text-typography-400">Add Exercise</Text>
                                                </Pressable>
                                            ) : (
                                                day.exercises.sort((a, b) => a.orderIndex - b.orderIndex).map((de, idx) => (
                                                    <Box
                                                        key={de.id}
                                                        className="p-6"
                                                        style={idx !== day.exercises.length - 1 ? { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' } : {}}
                                                    >
                                                        <HStack className="justify-between items-center space-x-4">
                                                            <Pressable
                                                                className="flex-1 active:opacity-60"
                                                                onPress={() => handleEditExercise(de, de.exercise)}
                                                            >
                                                                <VStack space="sm">
                                                                    <HStack space="xs" className="items-center">
                                                                        <Icon as={DumbbellIcon} size="sm" className="text-primary-energy" />
                                                                        <Text size="lg" className="font-bold text-typography-950">
                                                                            {de.exercise?.name || 'Unknown Exercise'}
                                                                        </Text>
                                                                    </HStack>
                                                                    <Text size="sm" className="text-typography-500 font-medium">
                                                                        {de.sets} sets • {de.trackingType === TrackingType.REPS ? `${de.targetReps || 0} reps` : `${de.targetTimeSeconds || 0}s`} • {de.resistanceType}
                                                                    </Text>
                                                                </VStack>
                                                            </Pressable>
                                                            <VStack space="sm">
                                                                <AppButton
                                                                    title="Delete"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    action="negative"
                                                                    icon={TrashIcon}
                                                                    onPress={() => handleDeleteExercise(de.id)}
                                                                    className="w-24 h-9"
                                                                />
                                                            </VStack>
                                                        </HStack>
                                                    </Box>
                                                ))
                                            )}
                                            <AppButton
                                                title="ADD EXERCISE"
                                                variant="solid"
                                                size="lg"
                                                icon={PlusIcon}
                                                className="py-4 h-16 rounded-none border-t bg-transparent"
                                                style={{ borderTopColor: 'rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(24, 23, 25, 0.2)' }}
                                                textClassName="ml-2 text-primary-energy font-bold text-md tracking-wider"
                                                onPress={() => handleOpenSelector(day.id)}
                                            />
                                        </VStack>
                                    )}
                                </AppCard>
                            </VStack>
                        ))
                    )}

                    {days.length > 0 && (
                        <AppButton
                            title="ADD ANOTHER DAY"
                            onPress={handleAddDay}
                            variant="outline"
                            icon={PlusIcon}
                            className="mt-4 border-dashed border-2 h-20 rounded-2xl border-primary-energy/30 mb-4 bg-transparent"
                            textClassName="text-primary-energy font-bold text-lg"
                        />
                    )}
                </VStack>
            </ScrollView>

            <ExerciseSelector
                isOpen={selectorOpen}
                onClose={() => setSelectorOpen(false)}
                onSelect={handleExerciseSelected}
            />

            <ProgramDayExerciseForm
                isOpen={exerciseFormOpen}
                onClose={() => setExerciseFormOpen(false)}
                onSubmit={handleExerciseFormSubmit}
                initialData={editingDayEx}
                selectedExercise={selectedExercise}
            />

            <AppAlert
                isOpen={showActiveSessionAlert}
                onClose={() => setShowActiveSessionAlert(false)}
                title="Workout in Progress"
                message="A session is already active. Please finish or abandon it first."
                buttons={[
                    {
                        text: "Go to Active Workout",
                        onPress: () => {
                            setShowActiveSessionAlert(false);
                            router.push('/active-workout');
                        }
                    },
                    { text: "Cancel", style: "cancel" }
                ]}
            />

            <RenameProgramDayDialog
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                onRename={handleRenameDay}
                initialName={days.find(d => d.id === renamingDayId)?.name || ''}
                loading={submitting}
            />

            <AppAlert
                isOpen={showDeleteDayAlert}
                onClose={() => setShowDeleteDayAlert(false)}
                title="Delete Day"
                message="Are you sure you want to delete this day? All scheduled exercises for this day will be removed."
                buttons={[
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: confirmDeleteDay
                    },
                    { text: "Cancel", style: "cancel" }
                ]}
            />
        </Box>
    );
};
