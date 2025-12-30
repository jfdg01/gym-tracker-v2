import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { CalendarIcon, ChevronRightIcon, TrophyIcon, FlameIcon, ZapIcon, ActivityIcon, DumbbellIcon } from 'lucide-react-native';
import { cn } from '@/src/utils/cn';
import { Program } from '@/src/types/domain';
import { AppCard } from './AppCard';
import { StaggeredItem } from './StaggeredItem';

const COOL_COLORS = [
    { text: "text-violet-400", border: "border-l-violet-500", icon: TrophyIcon },
    { text: "text-rose-400", border: "border-l-rose-500", icon: FlameIcon },
    { text: "text-cyan-400", border: "border-l-cyan-500", icon: ActivityIcon },
    { text: "text-emerald-400", border: "border-l-emerald-500", icon: ZapIcon },
    { text: "text-orange-400", border: "border-l-orange-500", icon: DumbbellIcon },
];

const getProgramStyles = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COOL_COLORS.length;
    return COOL_COLORS[index];
};

interface ProgramListItemProps {
    program: Program;
    index: number;
    dayCount?: { total: number, workout: number };
}

export const ProgramListItem = memo(({ program, index, dayCount }: ProgramListItemProps) => {
    const router = useRouter();
    const styles = getProgramStyles(program.id);

    return (
        <StaggeredItem
            index={index}
        >
            <Pressable
                onPress={() => router.push(`/program/${program.id}`)}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.05)' }}
                className="active:opacity-80"
            >
                <AppCard
                    className={cn(
                        "p-4 mb-3 border-l-4",
                        styles.border
                    )}
                >
                    <HStack className="justify-between items-center">
                        <VStack space="xs" className="flex-1 pr-4">
                            <HStack space="xs" className="items-center">
                                <Icon
                                    as={styles.icon}
                                    size="sm"
                                    className={styles.text}
                                />
                                <Text className="text-white font-bold text-lg">{program.name}</Text>
                            </HStack>
                            {program.description && (
                                <Text className="text-typography-500 text-sm italic mt-0.5" numberOfLines={1}>
                                    {program.description}
                                </Text>
                            )}
                            <HStack space="xs" className="mt-2 items-center">
                                <Icon as={CalendarIcon} size="xs" className="text-primary-energy" />
                                <Text className="text-typography-500 text-xs font-semibold">
                                    {dayCount?.total || 0} {dayCount?.total === 1 ? 'Day' : 'Days'}
                                    {(dayCount?.workout || 0) > 0 && ` • ${dayCount?.workout} Workouts`}
                                </Text>
                            </HStack>
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
    return prev.program.id === next.program.id &&
           prev.program.name === next.program.name &&
           prev.program.description === next.program.description &&
           prev.dayCount?.total === next.dayCount?.total &&
           prev.dayCount?.workout === next.dayCount?.workout;
});
