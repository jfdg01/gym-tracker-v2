import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { cn } from '@/src/utils/cn';
import { useRouter, useFocusEffect } from 'expo-router';
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
import { PlusIcon, CalendarIcon, ChevronRightIcon, Edit2Icon, TrashIcon, TrophyIcon, FlameIcon, ZapIcon, ActivityIcon, DumbbellIcon } from 'lucide-react-native';
import { ProgramService } from '@/src/services/ProgramService';
import { ProgramDayService } from '@/src/services/ProgramDayService';
import { Program } from '@/src/types/domain';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { ProgramForm } from '@/src/components/ProgramForm';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppScreenTitle } from '@/src/components/ui-library/AppScreenTitle';
import { StaggeredItem } from '@/src/components/ui-library/StaggeredItem';

const COOL_COLORS = [
    { text: "text-violet-400", border: "border-l-violet-500", icon: TrophyIcon },
    { text: "text-rose-400", border: "border-l-rose-500", icon: FlameIcon },
    { text: "text-cyan-400", border: "border-l-cyan-500", icon: ActivityIcon },
    { text: "text-emerald-400", border: "border-l-emerald-500", icon: ZapIcon },
    { text: "text-orange-400", border: "border-l-orange-500", icon: DumbbellIcon },
];

const getProgramStyles = (id: string) => {
    // Simple deterministic hash based on string ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COOL_COLORS.length;
    return COOL_COLORS[index];
};

export const ProgramListScreen = () => {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [programDayCounts, setProgramDayCounts] = useState<Record<string, { total: number, workout: number }>>({});
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
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

    const loadPrograms = async () => {
        setLoading(true);
        try {
            const data = await ProgramService.getAllPrograms();
            setPrograms(data);

            const counts = await ProgramService.getProgramStats();
            setProgramDayCounts(counts);
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to load programs", "error");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPrograms();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPrograms();
        setRefreshing(false);
    };

    const handleCreateProgram = () => {
        setEditingProgram(null);
        setFormOpen(true);
    };

    const handleEditProgram = (program: Program) => {
        setEditingProgram(program);
        setFormOpen(true);
    };

    const handleFormSubmit = async (data: Partial<Program>) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (editingProgram) {
                await ProgramService.updateProgram(editingProgram.id, data);
                showToast("Updated", "Program updated successfully");
            } else {
                const newProgram = await ProgramService.createProgram(data as any);
                showToast("Created", "Program created successfully");

                router.push(`/program/${newProgram.id}`);
            }
            await loadPrograms();
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to save program", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await ProgramService.deleteProgram(id);
            await loadPrograms();
            showToast("Deleted", "Program has been deleted");
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to delete program", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box className="flex-1 bg-surface-deep">
            <VStack space="md" className="flex-1 px-4 pt-12">
                <AppScreenTitle title="My Programs" />

                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                >
                    <VStack space="sm" className="pb-24 pt-4">
                        {programs.length === 0 ? (
                            <Text className="text-typography-500 text-center mt-4">No programs found. Create your first one!</Text>
                        ) : (
                            programs.map((p, index) => (
                                <StaggeredItem
                                    key={p.id}
                                    index={index}
                                >
                                    <Pressable
                                        onPress={() => router.push(`/program/${p.id}`)}
                                        android_ripple={{ color: 'rgba(255, 255, 255, 0.05)' }}
                                        className="active:opacity-80"
                                    >
                                        <AppCard
                                            className={cn(
                                                "p-4 mb-3 border-l-4",
                                                getProgramStyles(p.id).border
                                            )}
                                        >
                                            <HStack className="justify-between items-center">
                                                <VStack space="xs" className="flex-1 pr-4">
                                                    <HStack space="xs" className="items-center">
                                                        <Icon
                                                            as={getProgramStyles(p.id).icon}
                                                            size="sm"
                                                            className={getProgramStyles(p.id).text}
                                                        />
                                                        <Text className="text-white font-bold text-lg">{p.name}</Text>
                                                    </HStack>
                                                    {p.description && (
                                                        <Text className="text-typography-500 text-sm italic mt-0.5" numberOfLines={1}>
                                                            {p.description}
                                                        </Text>
                                                    )}
                                                    <HStack space="xs" className="mt-2 items-center">
                                                        <Icon as={CalendarIcon} size="xs" className="text-primary-energy" />
                                                        <Text className="text-typography-500 text-xs font-semibold">
                                                            {programDayCounts[p.id]?.total || 0} {programDayCounts[p.id]?.total === 1 ? 'Day' : 'Days'}
                                                            {(programDayCounts[p.id]?.workout || 0) > 0 && ` • ${programDayCounts[p.id].workout} Workouts`}
                                                        </Text>
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
                className="bg-primary-energy shadow-xl"
            >
                <FabIcon as={PlusIcon} />
            </Fab>
        </Box>
    );
};

