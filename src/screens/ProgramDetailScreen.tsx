import React, { useEffect, useState, useCallback } from 'react';
import { RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
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
    CoffeeIcon
} from 'lucide-react-native';
import { ProgramService } from '@/src/services/ProgramService';
import { ProgramDayService } from '@/src/services/ProgramDayService';
import { ProgramDayExerciseService } from '@/src/services/ProgramDayExerciseService';
import { ExerciseService } from '@/src/services/ExerciseService';
import { Program, ProgramDay, ProgramDayExercise, Exercise } from '@/src/types/domain';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { ExerciseSelector } from '@/src/components/ExerciseSelector';
import { ProgramDayExerciseForm } from '@/src/components/ProgramDayExerciseForm';

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

    // Exercise Management State
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [exerciseFormOpen, setExerciseFormOpen] = useState(false);
    const [activeDayId, setActiveDayId] = useState<string | null>(null);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [editingDayEx, setEditingDayEx] = useState<ProgramDayExercise | null>(null);

    const toast = useToast();

    const showToast = (title: string, description: string, action: 'success' | 'error' = 'success') => {
        toast.show({
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
        try {
            const nextDayNumber = days.length + 1;
            await ProgramDayService.createDay(id, `Day ${nextDayNumber}`);
            await loadData();
            showToast("Success", "Day added");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to add day", "error");
        }
    };

    const handleDeleteDay = async (dayId: string) => {
        try {
            await ProgramDayService.deleteDay(dayId);
            await loadData();
            showToast("Success", "Day deleted");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to delete day", "error");
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

    if (!program && loading) {
        return (
            <Box className="flex-1 bg-background-dark justify-center items-center">
                <Text>Loading...</Text>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-background-dark">
            {/* Header */}
            <VStack className="px-4 pt-12 pb-4 bg-surface-dark border-b border-outline-dark">
                <HStack space="md" className="items-center mb-4">
                    <Pressable onPress={() => router.back()}>
                        <Icon as={ChevronLeftIcon} size="xl" className="text-typography-500" />
                    </Pressable>
                    <VStack className="flex-1">
                        <Heading size="xl" className="text-typography-900">{program?.name}</Heading>
                        {program?.description && (
                            <Text size="sm" className="text-typography-500">{program.description}</Text>
                        )}
                    </VStack>
                </HStack>
            </VStack>

            <ScrollView
                className="flex-1 px-4"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#fff" />}
            >
                <VStack space="lg" className="py-6 pb-24">
                    {days.length === 0 ? (
                        <VStack space="md" className="items-center justify-center py-20">
                            <Text className="text-typography-500">No days added to this program yet.</Text>
                            <Button onPress={handleAddDay} variant="outline" size="sm">
                                <ButtonText>Add First Day</ButtonText>
                            </Button>
                        </VStack>
                    ) : (
                        days.sort((a, b) => a.orderIndex - b.orderIndex).map((day) => (
                            <VStack key={day.id} space="sm">
                                <HStack className="justify-between items-center mb-1">
                                    <Heading size="md" className={`${day.isRestDay ? 'text-typography-500' : 'text-primary-500'} italic`}>
                                        {day.name.toUpperCase()} {day.isRestDay && '(REST)'}
                                    </Heading>
                                    <HStack space="xs">
                                        <Button size="xs" variant="link" onPress={() => handleToggleRestDay(day.id, !!day.isRestDay)}>
                                            <Icon as={day.isRestDay ? DumbbellIcon : MoonIcon} size="xs" className="text-typography-400" />
                                        </Button>
                                        <Button size="xs" variant="link" action="negative" onPress={() => handleDeleteDay(day.id)}>
                                            <Icon as={TrashIcon} size="xs" className="text-error-500" />
                                        </Button>
                                    </HStack>
                                </HStack>

                                <Card className="p-0 overflow-hidden bg-surface-elevated border border-outline-dark">
                                    {day.isRestDay ? (
                                        <VStack className="p-10 items-center justify-center bg-surface-dark/30">
                                            <Icon as={CoffeeIcon} size="xl" className="text-typography-300 mb-2" />
                                            <Text className="text-typography-400 font-medium font-roboto">Rest & Recovery</Text>
                                            <Text size="xs" className="text-typography-500 text-center mt-1">Take it easy today to let your muscles grow.</Text>
                                        </VStack>
                                    ) : (
                                        <VStack>
                                            {day.exercises.length === 0 ? (
                                                <Pressable
                                                    className="p-8 items-center justify-center border-b border-outline-dark border-dashed"
                                                    onPress={() => handleOpenSelector(day.id)}
                                                >
                                                    <Icon as={PlusIcon} size="sm" className="text-typography-400 mb-2" />
                                                    <Text size="xs" className="text-typography-400">Add Exercise</Text>
                                                </Pressable>
                                            ) : (
                                                day.exercises.sort((a, b) => a.orderIndex - b.orderIndex).map((de, idx) => (
                                                    <Box
                                                        key={de.id}
                                                        className={`p-4 ${idx !== day.exercises.length - 1 ? 'border-b border-outline-dark' : ''}`}
                                                    >
                                                        <HStack className="justify-between items-center">
                                                            <VStack space="xs" className="flex-1">
                                                                <HStack space="xs" className="items-center">
                                                                    <Icon as={DumbbellIcon} size="xs" className="text-primary-400" />
                                                                    <Text className="font-bold text-typography-900">
                                                                        {de.exercise?.name || 'Unknown Exercise'}
                                                                    </Text>
                                                                </HStack>
                                                                <Text size="xs" className="text-typography-500">
                                                                    {de.sets} sets • {de.trackingType === 'REPS' ? `${de.targetReps} reps` : `${de.targetTimeSeconds}s`} • {de.resistanceType}
                                                                </Text>
                                                            </VStack>
                                                            <HStack space="sm">
                                                                <Button size="xs" variant="link" onPress={() => handleEditExercise(de, de.exercise)}>
                                                                    <Icon as={EditIcon} size="xs" className="text-typography-400" />
                                                                </Button>
                                                                <Button size="xs" variant="link" action="negative" onPress={() => handleDeleteExercise(de.id)}>
                                                                    <Icon as={TrashIcon} size="xs" className="text-error-500" />
                                                                </Button>
                                                            </HStack>
                                                        </HStack>
                                                    </Box>
                                                ))
                                            )}
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="py-3 bg-surface-dark items-center justify-center h-12"
                                                onPress={() => handleOpenSelector(day.id)}
                                            >
                                                <ButtonIcon as={PlusIcon} />
                                                <ButtonText className="ml-2">ADD EXERCISE</ButtonText>
                                            </Button>
                                        </VStack>
                                    )}
                                </Card>
                            </VStack>
                        ))
                    )}

                    {days.length > 0 && (
                        <Button onPress={handleAddDay} variant="outline" className="mt-4 border-dashed border-2">
                            <ButtonIcon as={PlusIcon} />
                            <ButtonText>ADD ANOTHER DAY</ButtonText>
                        </Button>
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
        </Box>
    );
};
