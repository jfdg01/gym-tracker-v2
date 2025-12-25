import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
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
import { PlusIcon } from 'lucide-react-native';
import { ExerciseService } from '@/src/services/ExerciseService';
import { Exercise } from '@/src/types/domain';
import { ExerciseForm } from '@/src/components/ExerciseForm';

export const TestExerciseScreen = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

    const loadExercises = async () => {
        setLoading(true);
        try {
            const data = await ExerciseService.getAllExercises();
            setExercises(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExercises();
    }, []);

    const handleCreateOrUpdate = async (data: Partial<Exercise>) => {
        try {
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
                await ExerciseService.createExercise({
                    name: data.name!,
                    description: data.description || null,
                    category: data.category || 'Strength',
                    defaultTrackingType: data.defaultTrackingType!,
                    defaultResistanceType: data.defaultResistanceType!,
                });
            }
            await loadExercises();
            setShowForm(false);
            setEditingExercise(null);
        } catch (e) {
            console.error(e);
        }
    };

    const handleArchive = async (id: string) => {
        try {
            await ExerciseService.archiveExercise(id);
            await loadExercises();
        } catch (e) {
            console.error(e);
        }
    };

    const openEdit = (exercise: Exercise) => {
        setEditingExercise(exercise);
        setShowForm(true);
    };

    const openCreate = () => {
        setEditingExercise(null);
        setShowForm(true);
    };

    return (
        <Box className="flex-1 bg-background-dark p-4">
            <VStack space="md" className="flex-1">
                <Heading className="text-typography-900 mt-8 mb-4">Exercises</Heading>

                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadExercises} tintColor="#fff" />
                    }
                >
                    <VStack space="sm" className="pb-24">
                        {exercises.length === 0 ? (
                            <Text className="text-typography-500 text-center mt-4">No exercises found.</Text>
                        ) : (
                            exercises.map((ex) => (
                                <Pressable key={ex.id} onPress={() => openEdit(ex)}>
                                    <Card className="p-4 bg-surface-elevated">
                                        <HStack className="justify-between items-center">
                                            <VStack>
                                                <Text className="text-typography-900 font-bold text-lg">{ex.name}</Text>
                                                <Text className="text-typography-500 text-sm">{ex.category}</Text>
                                                <Text className="text-typography-500 text-xs">{ex.defaultTrackingType} / {ex.defaultResistanceType}</Text>
                                            </VStack>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                action="negative"
                                                className="border-error-500"
                                                onPress={() => handleArchive(ex.id)}
                                            >
                                                <ButtonText className="text-error-500">Archive</ButtonText>
                                            </Button>
                                        </HStack>
                                    </Card>
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
                className="bg-primary-500"
            >
                <FabIcon as={PlusIcon} />
            </Fab>

            <ExerciseForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreateOrUpdate}
                initialData={editingExercise}
            />
        </Box>
    );
};
