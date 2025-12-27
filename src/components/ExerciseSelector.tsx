import React, { useState, useEffect } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import {
    Actionsheet,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetBackdrop,
    ActionsheetScrollView,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Icon, SearchIcon } from '@/components/ui/icon';
import { Heading } from '@/components/ui/heading';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Exercise } from '@/src/types/domain';
import { ExerciseService } from '@/src/services/ExerciseService';
import { X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';

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
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent className="max-h-[85%]">
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>

                <VStack space="md" className="w-full p-4">
                    <HStack className="justify-between items-center">
                        <Heading size="md">Select Exercise</Heading>
                        <Button variant="link" size="sm" onPress={onClose}>
                            <Icon as={X} size="xl" className="text-typography-500" />
                        </Button>
                    </HStack>

                    <Input>
                        <InputSlot className="pl-3">
                            <InputIcon as={SearchIcon} />
                        </InputSlot>
                        <InputField
                            placeholder="Search exercises..."
                            value={search}
                            onChangeText={setSearch}
                        />
                    </Input>
                </VStack>

                <ActionsheetScrollView className="w-full">
                    <VStack space="sm" className="px-4 pb-8">
                        {filtered.length === 0 ? (
                            <Text className="text-typography-500 text-center py-10">No exercises found</Text>
                        ) : (
                            filtered.map(ex => (
                                <Pressable
                                    key={ex.id}
                                    onPress={() => onSelect(ex)}
                                    className="p-4 mb-2 bg-surface-deep rounded-xl border border-outline-dark/5 shadow-soft-1"
                                    android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}
                                >
                                    <VStack space="xs">
                                        <Text className="font-bold text-lg text-typography-950">{ex.name}</Text>
                                        <HStack space="xs">
                                            <Badge size="sm" variant="solid" className="bg-background-100 rounded-full">
                                                <BadgeText className="text-typography-500 font-bold">{ex.category}</BadgeText>
                                            </Badge>
                                        </HStack>
                                    </VStack>
                                </Pressable>
                            ))
                        )}
                    </VStack>
                </ActionsheetScrollView>
            </ActionsheetContent>
        </Actionsheet>
    );
};
