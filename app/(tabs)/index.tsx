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
        <Box className="flex-1 bg-surface-deep px-4">
            <VStack space="xl" className="flex-1 pt-12">
                <Heading size="2xl" className="text-typography-950 font-heading">Gym Tracker</Heading>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <VStack space="lg" className="pb-8">
                        {/* Active Session Card */}
                        {activeSession ? (
                            <Card className="bg-primary-energy p-6 border-0 shadow-soft-2">
                                <VStack space="md">
                                    <HStack className="justify-between items-start">
                                        <VStack space="xs">
                                            <Text className="text-white/80 font-bold uppercase tracking-wider text-xs">Active Session</Text>
                                            <Heading className="text-white" size="xl">{activeSession.dayNameSnapshot}</Heading>
                                            <Text className="text-white/90 font-medium">{activeSession.programNameSnapshot}</Text>
                                        </VStack>
                                        <Box className="bg-white/20 p-2 rounded-full">
                                            <Icon as={RotateCcwIcon} size="xl" className="text-white" />
                                        </Box>
                                    </HStack>
                                    <Button
                                        size="lg"
                                        className="bg-white/10 mt-2 border border-white/20"
                                        onPress={() => router.push('/active-workout')}
                                    >
                                        <ButtonText className="text-white font-bold">RESUME WORKOUT</ButtonText>
                                    </Button>
                                </VStack>
                            </Card>
                        ) : (
                            <Card variant="elevated" className="p-6 border border-outline-dark/10">
                                <VStack space="sm" className="items-center py-4">
                                    <Icon as={PlayIcon} size="xl" className="text-primary-energy mb-2" />
                                    <Heading size="md" className="text-typography-950">Ready for your workout?</Heading>
                                    <Text className="text-typography-500 text-center">Select a program below to start your session.</Text>
                                </VStack>
                            </Card>
                        )}

                        {/* Program Selection */}
                        <VStack space="md" className="mt-4">
                            <Heading size="md" className="text-typography-950">Quick Start</Heading>
                            {programs.length === 0 ? (
                                <Card className="p-8 border-dashed border-2 border-outline-dark/30 items-center">
                                    <Text className="text-typography-500 text-center">You haven't created any programs yet.</Text>
                                    <Button
                                        variant="link"
                                        onPress={() => router.push('/programs')}
                                        className="mt-2"
                                    >
                                        <ButtonText className="text-primary-energy font-bold">Go to Programs</ButtonText>
                                    </Button>
                                </Card>
                            ) : (
                                programs.map((p) => {
                                    const suggestedDay = suggestedDays[p.id];
                                    return (
                                        <Card key={p.id} className="p-0 overflow-hidden shadow-soft-1">
                                            <Pressable
                                                onPress={() => suggestedDay && handleStartWorkout(suggestedDay.id)}
                                                disabled={!suggestedDay}
                                                android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}
                                            >
                                                <HStack className="p-5 items-center justify-between">
                                                    <VStack space="xs" className="flex-1">
                                                        <Text className="text-typography-950 font-bold text-lg">{p.name}</Text>
                                                        {suggestedDay ? (
                                                            <HStack space="xs" className="items-center">
                                                                <Icon as={CalendarIcon} size="xs" className="text-primary-energy" />
                                                                <Text className="text-primary-energy text-sm font-semibold">
                                                                    Next: {suggestedDay.name}
                                                                </Text>
                                                            </HStack>
                                                        ) : (
                                                            <Text className="text-typography-500 text-xs italic">No days configured</Text>
                                                        )}
                                                    </VStack>
                                                    <Box className="bg-primary-energy/10 p-2 rounded-full">
                                                        <Icon as={ChevronRightIcon} size="sm" className="text-primary-energy" />
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
