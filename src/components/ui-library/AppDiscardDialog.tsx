import React from 'react';
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { AppButton } from './AppButton';

interface AppDiscardDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const AppDiscardDialog = ({ isOpen, onClose, onConfirm }: AppDiscardDialogProps) => {
    return (
        <AlertDialog isOpen={isOpen} onClose={onClose}>
            <AlertDialogBackdrop />
            <AlertDialogContent
                className="bg-surface-elevated border"
                style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
            >
                <AlertDialogHeader>
                    <Heading size="md" className="text-white">Discard Changes?</Heading>
                </AlertDialogHeader>
                <AlertDialogBody className="mt-3 mb-4">
                    <Text size="sm" className="text-typography-400">
                        You are about to exit without saving. Any modifications will be lost.
                    </Text>
                </AlertDialogBody>
                <AlertDialogFooter className="space-x-3">
                    <AppButton
                        title="Keep Editing"
                        variant="outline"
                        onPress={onClose}
                        size="sm"
                    />
                    <AppButton
                        title="Discard"
                        action="negative"
                        onPress={onConfirm}
                        size="sm"
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
