import React, { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SearchIcon } from '@/components/ui/icon';
import { Exercise } from '@/src/types/domain';
import { ExerciseService } from '@/src/services/ExerciseService';
import { AppFormSheet } from './ui-library/AppFormSheet';
import { StatusBadge } from './ui-library/StatusBadge';
import { AppCard } from './ui-library/AppCard';

interface ExerciseSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exercise: Exercise) => void;
}

export const ExerciseSelector = ({ isOpen, onClose, onSelect }: ExerciseSelectorProps) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filtered, setFiltered] = useState<Exercise[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadExercises();
            setSearch('');
        }
    }, [isOpen]);

    const loadExercises = async () => {
        setLoading(true);
        try {
            const data = await ExerciseService.getAllExercises();
            setExercises(data);
            setFiltered(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(exercises);
        } else {
            const query = search.toLowerCase();
            setFiltered(exercises.filter(ex =>
                ex.name.toLowerCase().includes(query) ||
                (ex.category && ex.category.toLowerCase().includes(query))
            ));
        }
    }, [search, exercises]);

    return (
        <AppFormSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Select Exercise"
        >
            <VStack space="md" className="w-full">
                <Input className="bg-background-dark/30 border-outline-dark/20 h-12">
                    <InputSlot className="pl-3">
                        <InputIcon as={SearchIcon} className="text-typography-400" />
                    </InputSlot>
                    <InputField
                        placeholder="Search exercises..."
                        value={search}
                        onChangeText={setSearch}
                        className="text-typography-900"
                    />
                </Input>

                <VStack space="sm" className="pb-8 mt-2">
                    {filtered.length === 0 ? (
                        <Text className="text-typography-500 text-center py-10 italic">
                            {loading ? 'Loading...' : 'No exercises found'}
                        </Text>
                    ) : (
                        filtered.map(ex => (
                            <Pressable
                                key={ex.id}
                                onPress={() => onSelect(ex)}
                            >
                                <AppCard
                                    className="p-4 mb-2"
                                    style={{ elevation: 1 }}
                                >
                                    <VStack space="xs">
                                        <Text className="font-bold text-lg text-white">{ex.name}</Text>
                                        <StatusBadge label={ex.category || 'General'} variant="neutral" />
                                    </VStack>
                                </AppCard>
                            </Pressable>
                        ))
                    )}
                </VStack>
            </VStack>
        </AppFormSheet>
    );
};
