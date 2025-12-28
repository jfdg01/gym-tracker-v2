import React, { useState, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { AppButton } from '@/src/components/ui-library/AppButton';
import { AppInput } from '@/src/components/ui-library/AppInput';

interface RenameProgramDayDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onRename: (newName: string) => Promise<void>;
    initialName: string | null;
    loading?: boolean;
}

export const RenameProgramDayDialog = ({
    isOpen,
    onClose,
    onRename,
    initialName,
    loading = false
}: RenameProgramDayDialogProps) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen && initialName) {
            setName(initialName);
        }
    }, [isOpen, initialName]);

    const handleRename = async () => {
        if (!name.trim()) return;
        await onRename(name);
    };

    return (
        <AlertDialog isOpen={isOpen} onClose={onClose}>
            <AlertDialogBackdrop />
            <AlertDialogContent
                className="bg-surface-elevated border"
                style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
            >
                <AlertDialogHeader>
                    <Heading size="md" className="text-white">Rename Day</Heading>
                </AlertDialogHeader>
                <AlertDialogBody className="mt-3 mb-4">
                    <VStack space="sm">
                        <Text size="sm" className="text-typography-400">
                            Enter a new name for this day.
                        </Text>
                        <AppInput
                            placeholder="e.g. Leg Day"
                            value={name}
                            onChangeText={setName}
                            className="text-white border-primary-energy/30"
                            autoFocus
                        />
                    </VStack>
                </AlertDialogBody>
                <AlertDialogFooter className="space-x-3">
                    <AppButton
                        title="Cancel"
                        variant="outline"
                        onPress={onClose}
                        size="sm"
                    />
                    <AppButton
                        title="Rename"
                        action="primary"
                        onPress={handleRename}
                        size="sm"
                        loading={loading}
                        disabled={loading || !name.trim()}
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
