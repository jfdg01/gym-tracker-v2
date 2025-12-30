import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { CalendarIcon, ChevronRightIcon, DumbbellIcon, CoffeeIcon, ClockIcon } from 'lucide-react-native';
import { cn } from '@/src/utils/cn';
import { formatDuration } from '@/src/utils/time';
import { WorkoutSession } from '@/src/types/domain';
import { AppCard } from './AppCard';
import { StatusBadge } from './StatusBadge';
import { StaggeredItem } from './StaggeredItem';

interface HistoryItemProps {
    session: WorkoutSession;
    index: number;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export const HistoryItem = memo(({ session, index }: HistoryItemProps) => {
    const router = useRouter();

    const totalSets = !session.isRestDay && session.exercisesSnapshot
        ? session.exercisesSnapshot.reduce((acc, ex) => acc + ex.sets, 0)
        : 0;

    return (
        <StaggeredItem
            index={index}
        >
            <Pressable
                onPress={() => router.push(`/history/${session.id}`)}
            >
                <AppCard
                    className={cn(
                        "p-4 mb-3 border-l-4",
                        session.isRestDay ? "border-l-blue-400" : "border-l-primary-energy"
                    )}
                >
                    <HStack className="justify-between items-center">
                        <VStack space="sm" className="flex-1">
                            <HStack className="justify-between items-center pr-2">
                                <HStack space="xs" className="items-center">
                                    <Icon
                                        as={session.isRestDay ? CoffeeIcon : DumbbellIcon}
                                        size="sm"
                                        className={session.isRestDay ? "text-blue-400" : "text-primary-energy"}
                                    />
                                    <Text className="text-white font-bold text-lg">{session.dayNameSnapshot}</Text>
                                </HStack>
                                {session.status !== 'COMPLETED' && (
                                    <StatusBadge
                                        label={session.status === 'ABANDONED' ? 'Abandoned' : 'Active'}
                                        variant={session.status === 'ABANDONED' ? 'error' : 'primary'}
                                    />
                                )}
                            </HStack>

                            <HStack space="md" className="items-center">
                                <HStack space="xs" className="items-center">
                                    <Icon as={CalendarIcon} size="xs" className="text-typography-500" />
                                    <Text className="text-typography-500 text-xs font-medium">
                                        {session.completedAt ? formatDate(session.completedAt) : 'In Progress'}
                                    </Text>
                                </HStack>

                                {session.completedAt && (
                                    <HStack space="xs" className="items-center border-l border-white/10 pl-3">
                                        <Icon as={ClockIcon} size="xs" className="text-typography-500" />
                                        <Text className="text-typography-500 text-xs font-medium">
                                            {formatDuration(session.startedAt, session.completedAt)}
                                        </Text>
                                    </HStack>
                                )}
                            </HStack>

                            <VStack space="xs" className="mt-1">
                                <Text className="text-typography-400 text-xs uppercase tracking-wider font-semibold">
                                    {session.programNameSnapshot}
                                </Text>
                                {!session.isRestDay && session.exercisesSnapshot && (
                                    <Text className="text-typography-500 text-xs font-medium">
                                        {session.exercisesSnapshot.length} Exercises • {totalSets} Sets
                                    </Text>
                                )}
                                {session.isRestDay && (
                                    <Text className="text-blue-400/80 text-xs font-medium italic">
                                        Recovery Session
                                    </Text>
                                )}
                            </VStack>
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
    );
}, (prev, next) => {
    return prev.session.id === next.session.id && 
           prev.session.status === next.session.status &&
           prev.session.completedAt === next.session.completedAt;
});
