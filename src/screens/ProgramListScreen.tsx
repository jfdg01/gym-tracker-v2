import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Fab, FabIcon } from '@/components/ui/fab';
import { PlusIcon } from 'lucide-react-native';
import { ProgramService } from '@/src/services/ProgramService';
import { Program } from '@/src/types/domain';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { ProgramForm } from '@/src/components/ProgramForm';
import { AppScreenTitle } from '@/src/components/ui-library/AppScreenTitle';
import { ProgramListItem } from '@/src/components/ui-library/ProgramListItem';

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
            setFormOpen(false);
        }
    };

    const renderItem = useCallback(({ item, index }: { item: Program, index: number }) => (
        <ProgramListItem 
            program={item} 
            index={index} 
            dayCount={programDayCounts[item.id]} 
        />
    ), [programDayCounts]);

    return (
        <Box className="flex-1 bg-surface-deep">
            <VStack space="md" className="flex-1 px-4 pt-12">
                <AppScreenTitle title="My Programs" />

                <FlatList
                    data={programs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <Text className="text-typography-500 text-center mt-4">No programs found. Create your first one!</Text>
                        ) : null
                    }
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                />
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
