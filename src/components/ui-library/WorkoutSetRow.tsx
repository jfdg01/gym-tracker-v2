import React, { useState } from 'react';
import { Vibration } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CheckIcon, SkipForwardIcon } from 'lucide-react-native';
import { ExerciseSnapshotItem, WorkoutSet, TrackingType, ResistanceType } from '@/src/types/domain';
import { cn } from '@/src/utils/cn';

interface WorkoutSetRowProps {
    setNumber: number;
    exercise: ExerciseSnapshotItem;
    existingSet?: WorkoutSet;
    onLog: (data: Partial<WorkoutSet>) => void;
}

export const WorkoutSetRow = React.memo(({
    setNumber,
    exercise,
    existingSet,
    onLog
}: WorkoutSetRowProps) => {
    // Local state for interactive editing
    const [weight, setWeight] = useState(existingSet?.weight?.toString() || '');
    const [reps, setReps] = useState(existingSet?.reps?.toString() || '');
    const [time, setTime] = useState(existingSet?.timeSeconds?.toString() || '');
    const [difficulty, setDifficulty] = useState(existingSet?.difficulty || '');
    const [logged, setLogged] = useState(!!existingSet && !existingSet.skipped);
    const [skipped, setSkipped] = useState(existingSet?.skipped || false);

    const handleLog = () => {
        if (skipped) return;
        onLog({
            setNumber,
            exerciseId: exercise.exerciseId,
            weight: exercise.resistanceType === ResistanceType.WEIGHT ? (parseFloat(weight) || 0) : null,
            reps: exercise.trackingType === TrackingType.REPS ? (parseInt(reps) || 0) : null,
            timeSeconds: exercise.trackingType === TrackingType.TIME ? (parseInt(time) || 0) : null,
            difficulty: exercise.resistanceType === ResistanceType.DIFFICULTY ? difficulty : null,
            skipped: false
        });
        Vibration.vibrate(12);
        setLogged(true);
    };

    const handleSkip = () => {
        onLog({
            setNumber,
            exerciseId: exercise.exerciseId,
            skipped: true
        });
        setSkipped(true);
        setLogged(false);
    };

    const isReps = exercise.trackingType === TrackingType.REPS;
    const isWeight = exercise.resistanceType === ResistanceType.WEIGHT;

    return (
        <HStack
            space="md"
            className={cn(
                "items-center py-3 px-3 rounded-xl mb-1 border border-transparent",
                logged ? "bg-success-growth/10 border-success-growth/20" :
                    skipped ? "bg-background-dark/30 opacity-40" :
                        "bg-background-dark/20"
            )}
        >
            <Box className="w-8 items-center">
                <Text size="sm" className="font-bold text-typography-500">{setNumber}</Text>
            </Box>

            {isWeight ? (
                <Box className="flex-[1.2]">
                    <Input size="sm" variant="underlined" className="border-0 bg-white/5 rounded px-2">
                        <InputField
                            placeholder="kg"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                            className="text-white font-medium text-center"
                        />
                    </Input>
                </Box>
            ) : (
                <Box className="flex-[1.2]">
                    {
                        // TODO: Implement difficulty selection UI (RPE) 
                    }
                </Box>
            )}

            <Box className="flex-1">
                <Input size="sm" variant="underlined" className="border-0 bg-white/5 rounded px-2">
                    <InputField
                        placeholder={isReps ? "reps" : "secs"}
                        keyboardType="numeric"
                        value={isReps ? reps : time}
                        onChangeText={isReps ? setReps : setTime}
                        className="text-white font-medium text-center"
                    />
                </Input>
            </Box>

            <HStack space="xs" className="ml-2">
                {skipped ? (
                    <Button size="xs" variant="link" onPress={() => setSkipped(false)} className="px-2">
                        <ButtonText size="xs" className="text-primary-energy font-bold">UNSKIP</ButtonText>
                    </Button>
                ) : (
                    <>
                        <Button
                            size="sm"
                            variant="link"
                            onPress={handleSkip}
                            className="w-10 h-10 items-center justify-center p-0"
                        >
                            <Icon as={SkipForwardIcon} size="sm" className="text-typography-500" />
                        </Button>
                        <Button
                            size="md"
                            action={logged ? "positive" : "primary"}
                            variant={logged ? "solid" : "outline"}
                            className={cn(
                                "w-11 h-11 rounded-full p-0 flex items-center justify-center border-2",
                                logged ? "bg-success-growth border-success-growth" : "border-primary-energy/30"
                            )}
                            onPress={handleLog}
                        >
                            <Icon as={CheckIcon} size="md" className={logged ? "text-white" : "text-primary-energy"} />
                        </Button>
                    </>
                )}
            </HStack>
        </HStack>
    );
}, (prev, next) => (
    prev.existingSet?.id === next.existingSet?.id &&
    prev.setNumber === next.setNumber &&
    prev.exercise.exerciseId === next.exercise.exerciseId
));
