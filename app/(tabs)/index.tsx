import React, { useEffect, useState } from 'react';
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
import { PlayIcon, RotateCcwIcon, CalendarIcon, ChevronRightIcon } from 'lucide-react-native';
import { useWorkout } from '@/src/hooks/useWorkout';
import { ProgramService } from '@/src/services/ProgramService';
import { Program, ProgramDay } from '@/src/types/domain';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

export default function HomeScreen() {
    const router = useRouter();
    const { activeSession, startWorkout, loading: workoutLoading } = useWorkout();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [suggestedDays, setSuggestedDays] = useState<Record<string, ProgramDay | null>>({});
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const loadData = async () => {
        setLoading(true);
        try {
            const allPrograms = await ProgramService.getAllPrograms();
            setPrograms(allPrograms);

            const suggestions: Record<string, ProgramDay | null> = {};
            for (const p of allPrograms) {
                suggestions[p.id] = await ProgramService.getSuggestedDay(p.id);
            }
            setSuggestedDays(suggestions);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleStartWorkout = async (dayId: string) => {
        try {
            await startWorkout(dayId);
            router.push('/active-workout');
        } catch (e: any) {
            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={"toast-" + id} action="error" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Error</ToastTitle>
                            <ToastDescription>{e.message}</ToastDescription>
                        </VStack>
                    </Toast>
                ),
            });
        }
    };

    return (
        <Box className="flex-1 bg-background-dark p-4">
            <VStack space="xl" className="flex-1 pt-12">
                <Heading size="2xl" className="text-typography-900">Gym Tracker</Heading>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <VStack space="lg" className="pb-8">
                        {/* Active Session Card */}
                        {activeSession ? (
                            <Card className="bg-primary-600 p-6 border-0">
                                <VStack space="md">
                                    <HStack className="justify-between items-start">
                                        <VStack space="xs">
                                            <Text className="text-primary-100 font-bold uppercase tracking-wider text-xs">Active Session</Text>
                                            <Heading className="text-white" size="lg">{activeSession.dayNameSnapshot}</Heading>
                                            <Text className="text-primary-100">{activeSession.programNameSnapshot}</Text>
                                        </VStack>
                                        <Icon as={RotateCcwIcon} size="xl" className="text-white opacity-50" />
                                    </HStack>

                                    <Button
                                        size="lg"
                                        className="bg-white mt-2"
                                        onPress={() => router.push('/active-workout')}
                                    >
                                        <ButtonText className="text-primary-600 font-bold">RESUME WORKOUT</ButtonText>
                                    </Button>
                                </VStack>
                            </Card>
                        ) : (
                            <Box className="bg-surface-elevated p-6 rounded-2xl border border-outline-dark">
                                <VStack space="sm" className="items-center py-4">
                                    <Icon as={PlayIcon} size="xl" className="text-primary-500 mb-2" />
                                    <Heading size="md" className="text-typography-900">Ready for your workout?</Heading>
                                    <Text className="text-typography-500 text-center">Select a program below to start your session.</Text>
                                </VStack>
                            </Box>
                        )}

                        {/* Program Selection */}
                        <VStack space="md" className="mt-4">
                            <Heading size="md" className="text-typography-900">Quick Start</Heading>
                            {programs.length === 0 ? (
                                <Card className="p-8 bg-surface-dark border-dashed border-2 border-outline-dark items-center">
                                    <Text className="text-typography-500 text-center">You haven't created any programs yet.</Text>
                                    <Button
                                        variant="link"
                                        onPress={() => router.push('/programs')}
                                        className="mt-2"
                                    >
                                        <ButtonText className="text-primary-500">Go to Programs</ButtonText>
                                    </Button>
                                </Card>
                            ) : (
                                programs.map((p) => {
                                    const suggestedDay = suggestedDays[p.id];
                                    return (
                                        <Card key={p.id} className="p-0 overflow-hidden bg-surface-elevated border-0 shadow-sm">
                                            <Pressable
                                                onPress={() => suggestedDay && handleStartWorkout(suggestedDay.id)}
                                                disabled={!suggestedDay}
                                            >
                                                <HStack className="p-5 items-center justify-between">
                                                    <VStack space="xs" className="flex-1">
                                                        <Text className="text-typography-900 font-bold text-lg">{p.name}</Text>
                                                        {suggestedDay ? (
                                                            <HStack space="xs" className="items-center">
                                                                <Icon as={CalendarIcon} size="xs" className="text-primary-500" />
                                                                <Text className="text-primary-500 text-sm font-medium">
                                                                    Next: {suggestedDay.name}
                                                                </Text>
                                                            </HStack>
                                                        ) : (
                                                            <Text className="text-typography-500 text-xs italic">No days configured</Text>
                                                        )}
                                                    </VStack>
                                                    <Box className="bg-surface-dark p-2 rounded-full">
                                                        <Icon as={ChevronRightIcon} size="sm" className="text-typography-500" />
                                                    </Box>
                                                </HStack>
                                            </Pressable>
                                        </Card>
                                    );
                                })
                            )}
                        </VStack>
                    </VStack>
                </ScrollView>
            </VStack>
        </Box>
    );
}

import { Pressable } from 'react-native';
