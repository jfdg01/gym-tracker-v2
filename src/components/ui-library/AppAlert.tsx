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

export interface AppAlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AppAlertProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttons?: AppAlertButton[];
}

/**
 * A styled alternative to React Native's Alert.alert() that uses gluestack's AlertDialog.
 * Provides a consistent look and feel with the app's design system.
 * 
 * @example
 * const [showAlert, setShowAlert] = useState(false);
 * 
 * <AppAlert
 *   isOpen={showAlert}
 *   onClose={() => setShowAlert(false)}
 *   title="Workout in Progress"
 *   message="A session is already active. Please finish or abandon it first."
 *   buttons={[
 *     { text: "Go to Active Workout", onPress: () => router.push('/active-workout') },
 *     { text: "Cancel", style: "cancel" }
 *   ]}
 * />
 */
export const AppAlert = ({
    isOpen,
    onClose,
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }]
}: AppAlertProps) => {
    const handleButtonPress = (button: AppAlertButton) => {
        button.onPress?.();
        onClose();
    };

    const getButtonVariant = (style?: 'default' | 'cancel' | 'destructive') => {
        switch (style) {
            case 'cancel':
                return 'outline';
            case 'destructive':
                return 'solid';
            default:
                return 'solid';
        }
    };

    const getButtonAction = (style?: 'default' | 'cancel' | 'destructive') => {
        switch (style) {
            case 'destructive':
                return 'negative';
            default:
                return 'primary';
        }
    };

    return (
        <AlertDialog isOpen={isOpen} onClose={onClose}>
            <AlertDialogBackdrop />
            <AlertDialogContent
                className="bg-surface-elevated border"
                style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
            >
                <AlertDialogHeader>
                    <Heading size="md" className="text-white">{title}</Heading>
                </AlertDialogHeader>
                <AlertDialogBody className="mt-3 mb-4">
                    <Text size="sm" className="text-typography-400">
                        {message}
                    </Text>
                </AlertDialogBody>
                <AlertDialogFooter className="space-x-3">
                    {buttons.map((button, index) => (
                        <AppButton
                            key={index}
                            title={button.text}
                            variant={getButtonVariant(button.style)}
                            action={getButtonAction(button.style)}
                            onPress={() => handleButtonPress(button)}
                            size="sm"
                        />
                    ))}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
