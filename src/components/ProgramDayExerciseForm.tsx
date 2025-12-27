import React from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
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
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import { Heading } from '@/components/ui/heading';
import { X, ChevronDown } from 'lucide-react-native';
import { ProgramDayExercise, TrackingType, ResistanceType, Exercise } from '@/src/types/domain';
import { useProgramDayExerciseForm } from '@/src/hooks/useProgramDayExerciseForm';

interface ProgramDayExerciseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<ProgramDayExercise>) => Promise<void>;
    initialData?: ProgramDayExercise | null;
    selectedExercise?: Exercise | null;
}

export const ProgramDayExerciseForm = (props: ProgramDayExerciseFormProps) => {
    const { isOpen, initialData, selectedExercise } = props;
    const {
        formState: {
            loading,
            formKey,
            trackingType,
            resistanceType,
        },
        actions: {
            setTrackingType,
            setResistanceType,
            handleManualSave,
            handleSheetClose,
        },
        refs: {
            setsRef,
            targetRepsRef,
            targetTimeRef,
        }
    } = useProgramDayExerciseForm(props);

    return (
        <Actionsheet isOpen={isOpen} onClose={handleSheetClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent className="max-h-[85%]">
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>

                <ActionsheetScrollView className="w-full">
                    <VStack space="md" className="w-full p-4 mb-8" key={formKey}>
                        <HStack className="w-full justify-between items-center">
                            <VStack>
                                <Text className="text-xl font-bold text-typography-900">
                                    {initialData ? 'Edit Exercise' : 'Add Exercise'}
                                </Text>
                                <Text className="text-sm text-primary-500 font-medium">
                                    {(selectedExercise?.name || initialData?.id || '').toUpperCase()}
                                </Text>
                            </VStack>
                            <Button size="sm" variant="link" onPress={handleSheetClose} className="p-0">
                                <Icon as={X} size="xl" className="text-typography-500" />
                            </Button>
                        </HStack>

                        <VStack space="sm">
                            <Text className="text-sm font-medium text-typography-700">Sets</Text>
                            <Input>
                                <InputField
                                    defaultValue={setsRef.current}
                                    onChangeText={(t) => setsRef.current = t}
                                    placeholder="Number of sets"
                                    keyboardType="numeric"
                                />
                            </Input>
                        </VStack>

                        <HStack space="md" className="w-full">
                            <VStack space="sm" className="flex-1">
                                <Text className="text-sm font-medium text-typography-700">Tracking</Text>
                                <Select selectedValue={trackingType} onValueChange={(v) => setTrackingType(v as TrackingType)}>
                                    <SelectTrigger>
                                        <SelectInput placeholder="Type" />
                                        <SelectIcon as={ChevronDown} className="mr-3" />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectItem label="Reps" value={TrackingType.REPS} />
                                            <SelectItem label="Time" value={TrackingType.TIME} />
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </VStack>

                            <VStack space="sm" className="flex-1">
                                <Text className="text-sm font-medium text-typography-700">Resistance</Text>
                                <Select selectedValue={resistanceType} onValueChange={(v) => setResistanceType(v as ResistanceType)}>
                                    <SelectTrigger>
                                        <SelectInput placeholder="Type" />
                                        <SelectIcon as={ChevronDown} className="mr-3" />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectItem label="Weight" value={ResistanceType.WEIGHT} />
                                            <SelectItem label="Difficulty" value={ResistanceType.DIFFICULTY} />
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </VStack>
                        </HStack>

                        {trackingType === TrackingType.REPS ? (
                            <VStack space="sm">
                                <Text className="text-sm font-medium text-typography-700">Target Reps</Text>
                                <Input>
                                    <InputField
                                        defaultValue={targetRepsRef.current}
                                        onChangeText={(t) => targetRepsRef.current = t}
                                        placeholder="e.g. 10"
                                        keyboardType="numeric"
                                    />
                                </Input>
                            </VStack>
                        ) : (
                            <VStack space="sm">
                                <Text className="text-sm font-medium text-typography-700">Target Time (Seconds)</Text>
                                <Input>
                                    <InputField
                                        defaultValue={targetTimeRef.current}
                                        onChangeText={(t) => targetTimeRef.current = t}
                                        placeholder="e.g. 60"
                                        keyboardType="numeric"
                                    />
                                </Input>
                            </VStack>
                        )}

                        <Button
                            onPress={handleManualSave}
                            isDisabled={loading}
                            className="mt-4 mb-8 h-14 bg-primary-energy rounded-xl"
                        >
                            {loading && <Spinner color="white" className="mr-2" />}
                            <ButtonText className="font-bold text-lg">{loading ? 'Saving...' : 'Confirm Exercise'}</ButtonText>
                        </Button>
                    </VStack>
                </ActionsheetScrollView>
            </ActionsheetContent>
        </Actionsheet>
    );
};
