import React from 'react';
import { ScrollView } from '@/components/ui/scroll-view';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import {
    TrashIcon,
    EditIcon,
    PlayIcon,
    RotateCcwIcon,
    PlusIcon,
    SettingsIcon,
    DumbbellIcon
} from 'lucide-react-native';

import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppCard } from '@/src/components/ui-library/AppCard';
import { ExerciseCard } from '@/src/components/ui-library/ExerciseCard';
import { ProgramCard } from '@/src/components/ui-library/ProgramCard';
import { ProgramDayCard } from '@/src/components/ui-library/ProgramDayCard';
import { TrackingType, ResistanceType } from '@/src/types/domain';

export default function ComponentsGallery() {
    return (
        <Box className="flex-1 bg-surface-deep">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
                <VStack space="2xl">
                    <VStack space="xs">
                        <Heading size="2xl" className="text-white">Components Gallery</Heading>
                        <Text className="text-typography-500">Visual test library for our custom components.</Text>
                    </VStack>

                    <Divider className="bg-outline-dark/30" />

                    {/* App Buttons Section */}
                    <Section title="UI-Library: AppButton">
                        <VStack space="md">
                            <HStack space="md" className="flex-wrap">
                                <AppButton title="Primary" action="primary" />
                                <AppButton title="Positive" action="positive" />
                                <AppButton title="Negative" action="negative" />
                                <AppButton title="Secondary" action="secondary" />
                            </HStack>

                            <Text className="text-typography-500 text-sm mt-2">Variants:</Text>
                            <HStack space="md" className="flex-wrap">
                                <AppButton title="Solid" variant="solid" action="primary" />
                                <AppButton title="Outline" variant="outline" action="primary" />
                                <AppButton title="Link" variant="link" action="primary" />
                            </HStack>

                            <Text className="text-typography-500 text-sm mt-2">With Icons & States:</Text>
                            <HStack space="md" className="flex-wrap items-center">
                                <AppButton title="Start" icon={PlayIcon} action="primary" />
                                <AppButton title="Edit" icon={EditIcon} variant="outline" size="sm" />
                                <AppButton title="Delete" icon={TrashIcon} action="negative" size="sm" />
                                <AppButton title="Loading" loading={true} action="primary" />
                            </HStack>
                        </VStack>
                    </Section>

                    {/* Cards Section */}
                    <Section title="UI-Library: AppCard">
                        <VStack space="md">
                            <AppCard>
                                <Text className="text-white">This is a standard Elevated AppCard.</Text>
                            </AppCard>
                            <AppCard variant="outline">
                                <Text className="text-white">This is an Outline AppCard.</Text>
                            </AppCard>
                        </VStack>
                    </Section>

                    {/* Specialized Cards Section */}
                    <Section title="Specialized: ExerciseCard">
                        <ExerciseCard
                            exercise={{
                                id: '1',
                                name: 'Bench Press',
                                category: 'Chest',
                                defaultTrackingType: TrackingType.REPS,
                                defaultResistanceType: ResistanceType.WEIGHT,
                                description: 'Standard bench press',
                                isArchived: false,
                                createdAt: '',
                                updatedAt: ''
                            }}
                        />
                    </Section>

                    <Section title="Specialized: ProgramCard">
                        <ProgramCard
                            program={{
                                id: '1',
                                name: 'Hypertrophy Phase 1',
                                description: 'Build muscle',
                                lastCompletedDayId: null,
                                createdAt: '',
                                updatedAt: ''
                            }}
                            suggestedDay={{
                                id: '1',
                                programId: '1',
                                name: 'Push Day',
                                orderIndex: 0,
                                isRestDay: false
                            }}
                        />
                    </Section>

                    <Section title="Specialized: ProgramDayCard">
                        <ProgramDayCard
                            day={{
                                id: '1',
                                programId: '1',
                                name: 'Leg Day (A)',
                                orderIndex: 0,
                                isRestDay: false
                            }}
                            exercises={[
                                { id: '1', programDayId: '1', exerciseId: '1', exerciseName: 'Squat', sets: 3, targetReps: 8, trackingType: TrackingType.REPS, resistanceType: ResistanceType.WEIGHT, orderIndex: 0, targetTimeSeconds: null },
                                { id: '2', programDayId: '1', exerciseId: '2', exerciseName: 'Leg Press', sets: 4, targetReps: 12, trackingType: TrackingType.REPS, resistanceType: ResistanceType.WEIGHT, orderIndex: 1, targetTimeSeconds: null }
                            ]}
                        />
                    </Section>

                </VStack>
            </ScrollView>
        </Box>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <VStack space="md">
            <Heading size="md" className="text-primary-energy uppercase tracking-wider">{title}</Heading>
            {children}
        </VStack>
    );
}
