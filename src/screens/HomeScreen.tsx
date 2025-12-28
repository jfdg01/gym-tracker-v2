import React, { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { PlayIcon, RotateCcwIcon } from 'lucide-react-native';
import { useWorkout } from '@/src/hooks/useWorkout';
import { ProgramService } from '@/src/services/ProgramService';
import { Program, ProgramDay } from '@/src/types/domain';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { AppAlert } from '@/src/components/ui-library/AppAlert';
import { AppScreenTitle } from '@/src/components/ui-library/AppScreenTitle';
import { ProgramCard } from '@/src/components/ui-library/ProgramCard';

export function HomeScreen() {
    const router = useRouter();
    const { activeSession, startWorkout, loading: workoutLoading, refresh: refreshActiveSession } = useWorkout();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [suggestedDays, setSuggestedDays] = useState<Record<string, ProgramDay | null>>({});
    const [loading, setLoading] = useState(false);
    const [showActiveSessionAlert, setShowActiveSessionAlert] = useState(false);
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

    useFocusEffect(
        useCallback(() => {
            loadData();
            refreshActiveSession();
        }, [])
    );

    const handleStartWorkout = async (dayId: string) => {
        try {
            if (activeSession) {
                setShowActiveSessionAlert(true);
                return;
            }
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

    const handleGoToActiveWorkout = () => {
        setShowActiveSessionAlert(false);
        router.push('/active-workout');
    };

    return (
        <Box className="flex-1 bg-surface-deep px-4">
            <VStack space="xl" className="flex-1 pt-12">
                <AppScreenTitle title="Gym Tracker" />

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <VStack space="lg" className="pb-8">
                        {/* Active Session Card */}
                        {activeSession ? (
                            <AppCard className="bg-primary-energy p-6 border-0">
                                <VStack space="md">
                                    <HStack className="justify-between items-start">
                                        <VStack space="xs">
                                            <Text
                                                className="font-bold uppercase tracking-wider text-xs"
                                                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                            >
                                                Active Session
                                            </Text>
                                            <Heading className="text-white" size="xl">{activeSession.dayNameSnapshot}</Heading>
                                            <Text
                                                className="font-medium"
                                                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                            >
                                                {activeSession.programNameSnapshot}
                                            </Text>
                                        </VStack>
                                        <Box
                                            className="rounded-full p-2"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                        >
                                            <Icon as={RotateCcwIcon} size="xl" className="text-white" />
                                        </Box>
                                    </HStack>
                                    <AppButton
                                        title="RESUME WORKOUT"
                                        size="lg"
                                        className="mt-2"
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                                        variant="outline"
                                        textClassName="text-white font-bold"
                                        onPress={() => router.push('/active-workout')}
                                    />
                                </VStack>
                            </AppCard>
                        ) : (
                            <AppCard className="p-6">
                                <VStack space="sm" className="items-center py-4">
                                    <Icon as={PlayIcon} size="xl" className="text-primary-energy mb-2" />
                                    <Heading size="md" className="text-white">Ready for your workout?</Heading>
                                    <Text className="text-typography-500 text-center">Select a program below to start your session.</Text>
                                </VStack>
                            </AppCard>
                        )}

                        {/* Program Selection */}
                        <VStack space="md" className="mt-4">
                            <Heading size="md" className="text-white">Quick Start</Heading>
                            {programs.length === 0 ? (
                                <AppCard
                                    className="p-8 border-dashed border-2 items-center"
                                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                                >
                                    <Text className="text-typography-500 text-center">You haven't created any programs yet.</Text>
                                    <AppButton
                                        title="Go to Programs"
                                        variant="link"
                                        onPress={() => router.push('/programs')}
                                        className="mt-2"
                                        textClassName="text-primary-energy font-bold"
                                    />
                                </AppCard>
                            ) : (
                                programs.map((p) => (
                                    <ProgramCard
                                        key={p.id}
                                        program={p}
                                        suggestedDay={suggestedDays[p.id]}
                                        onPress={() => suggestedDays[p.id] && handleStartWorkout(suggestedDays[p.id]!.id)}
                                    />
                                ))
                            )}
                        </VStack>
                    </VStack>
                </ScrollView>
            </VStack>

            <AppAlert
                isOpen={showActiveSessionAlert}
                onClose={() => setShowActiveSessionAlert(false)}
                title="Workout in Progress"
                message="A session is already active. Please finish or abandon it first."
                buttons={[
                    { text: "Go to Active Workout", onPress: handleGoToActiveWorkout },
                    { text: "Cancel", style: "cancel" }
                ]}
            />
        </Box>
    );
}
