import React from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
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
import { Icon } from '@/components/ui/icon';
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { X } from 'lucide-react-native';
import { Program } from '@/src/types/domain';
import { useProgramForm } from '@/src/hooks/useProgramForm';

interface ProgramFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Program>) => Promise<void>;
    initialData?: Program | null;
}

export const ProgramForm = (props: ProgramFormProps) => {
    const { isOpen, initialData } = props;
    const {
        formState: {
            loading,
            errors,
            formKey,
            showDiscardAlert,
        },
        actions: {
            setShowDiscardAlert,
            handleManualSave,
            handleSheetClose,
            handleDiscardPress,
            confirmDiscard,
            setErrors,
        },
        refs: {
            nameRef,
            descriptionRef,
        }
    } = useProgramForm(props);

    return (
        <>
            <Actionsheet isOpen={isOpen} onClose={handleSheetClose}>
                <ActionsheetBackdrop />
                <ActionsheetContent className="max-h-[85%]">
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>

                    <ActionsheetScrollView className="w-full">
                        <VStack space="md" className="w-full p-4 mb-8" key={formKey}>
                            <HStack className="w-full justify-between items-center">
                                <Text className="text-xl font-bold text-typography-900">
                                    {initialData ? 'Edit Program' : 'New Program'}
                                </Text>
                                <Button size="sm" variant="link" onPress={handleDiscardPress} className="p-0">
                                    <Icon as={X} size="xl" className="text-typography-500" />
                                </Button>
                            </HStack>

                            <VStack space="sm">
                                <Text className="text-sm font-medium text-typography-700">Name <Text className="text-error-500">*</Text></Text>
                                <Input isInvalid={!!errors.name}>
                                    <InputField
                                        defaultValue={nameRef.current}
                                        onChangeText={(t) => { nameRef.current = t; if (errors.name) setErrors({ ...errors, name: '' }); }}
                                        placeholder="e.g. Push Pull Legs"
                                        autoCorrect={false}
                                    />
                                </Input>
                                {errors.name && <Text className="text-error-500 text-xs">{errors.name}</Text>}
                            </VStack>

                            <VStack space="sm">
                                <Text className="text-sm font-medium text-typography-700">Description</Text>
                                <Textarea>
                                    <TextareaInput
                                        defaultValue={descriptionRef.current}
                                        onChangeText={(t) => descriptionRef.current = t}
                                        placeholder="Optional description of the program goals..."
                                        autoCorrect={false}
                                    />
                                </Textarea>
                            </VStack>

                            <Button
                                onPress={handleManualSave}
                                isDisabled={loading}
                                className="mt-4 mb-8"
                            >
                                {loading && <Spinner color="white" className="mr-2" />}
                                <ButtonText>{loading ? 'Saving...' : 'Save Program'}</ButtonText>
                            </Button>
                        </VStack>
                    </ActionsheetScrollView>
                </ActionsheetContent>
            </Actionsheet>

            <AlertDialog isOpen={showDiscardAlert} onClose={() => setShowDiscardAlert(false)}>
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading size="md" className="text-typography-950">Discard Changes?</Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text size="sm" className="text-typography-500">
                            You are about to exit without saving. Any changes will be lost.
                            Are you sure?
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            action="secondary"
                            onPress={() => setShowDiscardAlert(false)}
                            size="sm"
                            className="mr-3"
                        >
                            <ButtonText>Keep Editing</ButtonText>
                        </Button>
                        <Button
                            action="negative"
                            onPress={confirmDiscard}
                            size="sm"
                        >
                            <ButtonText>Discard</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
