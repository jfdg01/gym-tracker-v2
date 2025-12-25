import React, { useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Divider } from '@/components/ui/divider';
import { ExerciseService } from '@/src/services/ExerciseService';
import { Exercise, TrackingType, ResistanceType } from '@/src/types/domain';

export const TestExerciseScreen = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleCreate = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await ExerciseService.createExercise({
                name: name,
                description: 'Test Description',
                category: 'Strength',
                defaultTrackingType: TrackingType.REPS,
                defaultResistanceType: ResistanceType.WEIGHT,
            });
            setName('');
            await loadExercises();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
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

    return (
        <Box className="flex-1 bg-background-dark p-4">
            <VStack space="md" className="flex-1">
                <Heading className="text-typography-900 mt-8 mb-4">Exercise Test Repo</Heading>

                <Card className="p-4 bg-surface-elevated mb-4">
                    <VStack space="sm">
                        <Text className="text-typography-700 font-bold">New Exercise</Text>
                        <HStack space="sm">
                            <Input className="flex-1">
                                <InputField
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Exercise Name"
                                />
                            </Input>
                            <Button onPress={handleCreate} disabled={!name}>
                                <ButtonText>Add</ButtonText>
                            </Button>
                        </HStack>
                    </VStack>
                </Card>

                <Divider className="my-2" />

                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadExercises} tintColor="#fff" />
                    }
                >
                    <VStack space="sm" className="pb-8">
                        {exercises.length === 0 ? (
                            <Text className="text-typography-500 text-center mt-4">No exercises found.</Text>
                        ) : (
                            exercises.map((ex) => (
                                <Card key={ex.id} className="p-4 bg-surface-elevated">
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
                            ))
                        )}
                    </VStack>
                </ScrollView>
            </VStack>
        </Box>
    );
};
