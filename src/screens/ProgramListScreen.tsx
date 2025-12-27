import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
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
import { PlusIcon, CalendarIcon, ChevronRightIcon, Edit2Icon } from 'lucide-react-native';
import { ProgramService } from '@/src/services/ProgramService';
import { ProgramDayService } from '@/src/services/ProgramDayService';
import { Program } from '@/src/types/domain';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { ProgramForm } from '@/src/components/ProgramForm';

export const ProgramListScreen = () => {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [programDayCounts, setProgramDayCounts] = useState<Record<string, { total: number, workout: number }>>({});
    const [loading, setLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    const toast = useToast();

    const showToast = (title: string, description: string, action: 'success' | 'error' = 'success') => {
        toast.show({
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

    const loadPrograms = async () => {
        setLoading(true);
        try {
            const data = await ProgramService.getAllPrograms();
            setPrograms(data);

            // Load day counts for each program
            const counts: Record<string, { total: number, workout: number }> = {};
            for (const program of data) {
                const days = await ProgramDayService.getDaysByProgramId(program.id);
                counts[program.id] = {
                    total: days.length,
                    workout: days.filter(d => !d.isRestDay).length,
                };
            }
            setProgramDayCounts(counts);
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to load programs", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrograms();
    }, []);

    const handleCreateProgram = () => {
        setEditingProgram(null);
        setFormOpen(true);
    };

    const handleEditProgram = (program: Program) => {
        setEditingProgram(program);
        setFormOpen(true);
    };

    const handleFormSubmit = async (data: Partial<Program>) => {
        try {
            if (editingProgram) {
                await ProgramService.updateProgram(editingProgram.id, data);
                showToast("Updated", "Program updated successfully");
            } else {
                await ProgramService.createProgram(data as any);
                showToast("Created", "Program created successfully");
            }
            await loadPrograms();
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to save program", "error");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await ProgramService.deleteProgram(id);
            await loadPrograms();
            showToast("Deleted", "Program has been deleted");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to delete program", "error");
        }
    };

    return (
        <Box className="flex-1 bg-background-dark p-4">
            <VStack space="md" className="flex-1">
                <Heading className="text-typography-900 mt-8 mb-4">My Programs</Heading>

                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadPrograms} tintColor="#fff" />
                    }
                >
                    <VStack space="sm" className="pb-24 pt-4">
                        {programs.length === 0 ? (
                            <Text className="text-typography-500 text-center mt-4">No programs found. Create your first one!</Text>
                        ) : (
                            programs.map((p) => (
                                <Card key={p.id} className="p-4 bg-surface-elevated border-l-4 border-primary-500 mb-2">
                                    <HStack className="justify-between items-center">
                                        <Pressable onPress={() => router.push(`/program/${p.id}`)} className="flex-1">
                                            <VStack space="xs">
                                                <Text className="text-typography-900 font-bold text-lg">{p.name}</Text>
                                                {p.description && (
                                                    <Text className="text-typography-500 text-sm italic" numberOfLines={1}>
                                                        {p.description}
                                                    </Text>
                                                )}
                                                <HStack space="xs" className="mt-2 items-center">
                                                    <Icon as={CalendarIcon} size="xs" className="text-primary-500" />
                                                    <Text className="text-typography-400 text-xs">
                                                        {programDayCounts[p.id]?.total || 0} {programDayCounts[p.id]?.total === 1 ? 'Day' : 'Days'}
                                                        {(programDayCounts[p.id]?.workout || 0) > 0 && ` • ${programDayCounts[p.id].workout} Workouts`}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </Pressable>

                                        <HStack space="sm" className="items-center">
                                            <Button
                                                size="xs"
                                                variant="link"
                                                onPress={() => handleEditProgram(p)}
                                            >
                                                <Icon as={Edit2Icon} size="sm" className="text-typography-400" />
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="link"
                                                action="negative"
                                                onPress={() => handleDelete(p.id)}
                                            >
                                                <ButtonText className="text-error-500">Delete</ButtonText>
                                            </Button>
                                            <Icon as={ChevronRightIcon} className="text-typography-300" />
                                        </HStack>
                                    </HStack>
                                </Card>
                            ))
                        )}
                    </VStack>
                </ScrollView>
            </VStack>

            <ProgramForm
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingProgram}
            />

            <Fab
                size="lg"
                placement="bottom right"
                onPress={handleCreateProgram}
                className="bg-primary-500"
            >
                <FabIcon as={PlusIcon} />
            </Fab>
        </Box>
    );
};

