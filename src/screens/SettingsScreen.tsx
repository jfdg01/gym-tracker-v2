import React, { useState } from 'react';
import { Share, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import {
    DownloadIcon,
    UploadIcon,
    InfoIcon,
    ShieldCheckIcon,
    ChevronRightIcon,
    LayoutIcon,
    Trash2Icon
} from 'lucide-react-native';
import { DataPortabilityService } from '@/src/services/DataPortabilityService';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { AppAlert } from '@/src/components/ui-library/AppAlert';
import { AppScreenTitle } from '@/src/components/ui-library/AppScreenTitle';

export const SettingsScreen = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const toast = useToast();

    const [showExportSuccessAlert, setShowExportSuccessAlert] = useState(false);
    const [exportFilePath, setExportFilePath] = useState('');
    const [showExportErrorAlert, setShowExportErrorAlert] = useState(false);
    const [showImportConfirmAlert, setShowImportConfirmAlert] = useState(false);
    const [showImportErrorAlert, setShowImportErrorAlert] = useState(false);
    const [showImportFailedAlert, setShowImportFailedAlert] = useState(false);
    const [showDeleteConfirmAlert, setShowDeleteConfirmAlert] = useState(false);
    const [showActiveWorkoutAlert, setShowActiveWorkoutAlert] = useState(false);
    const [pendingImportData, setPendingImportData] = useState<any>(null);

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await DataPortabilityService.exportAllData();
            const jsonString = JSON.stringify(data, null, 2);
            const now = new Date();
            const YYYY = now.getFullYear();
            const MM = String(now.getMonth() + 1).padStart(2, '0');
            const DD = String(now.getDate()).padStart(2, '0');
            const HH = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const filename = `gym_tracker_backup_${YYYY}-${MM}-${DD}_${HH}-${mm}.json`;
            const fileUri = FileSystem.documentDirectory + filename;

            await FileSystem.writeAsStringAsync(fileUri, jsonString, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                setExportFilePath(fileUri);
                setShowExportSuccessAlert(true);
            }
        } catch (e) {
            console.error(e);
            setShowExportErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        setLoading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                setLoading(false);
                return;
            }

            const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const data = JSON.parse(fileContent);
            setPendingImportData(data);
            setShowImportConfirmAlert(true);
        } catch (e) {
            console.error(e);
            setShowImportFailedAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmImport = async () => {
        setShowImportConfirmAlert(false);
        try {
            await DataPortabilityService.importData(pendingImportData);
            toast.show({
                id: 'gym-tracker-toast-import',
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={"toast-" + id} action="success" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Import Successful</ToastTitle>
                            <ToastDescription>Your data has been imported.</ToastDescription>
                        </VStack>
                    </Toast>
                ),
            });
        } catch (err: any) {
            console.error(err);
            if (err.message === 'Cannot import data while a workout is in progress.') {
                setShowActiveWorkoutAlert(true);
            } else {
                setShowImportErrorAlert(true);
            }
        }
        setPendingImportData(null);
    };

    const handleDeleteDatabase = async () => {
        setShowDeleteConfirmAlert(false);
        setLoading(true);
        try {
            await DataPortabilityService.deleteAllData();
            toast.show({
                id: 'gym-tracker-toast-delete',
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={"toast-" + id} action="success" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Database Cleared</ToastTitle>
                            <ToastDescription>All your data has been permanently deleted.</ToastDescription>
                        </VStack>
                    </Toast>
                ),
            });
        } catch (e) {
            console.error(e);
            toast.show({
                id: 'gym-tracker-toast-delete-error',
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={"toast-" + id} action="error" variant="outline">
                        <VStack space="xs">
                            <ToastTitle>Deletion Failed</ToastTitle>
                            <ToastDescription>An error occurred while deleting the database.</ToastDescription>
                        </VStack>
                    </Toast>
                ),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="flex-1 bg-surface-deep px-4">
            <VStack space="xl" className="flex-1 mt-12">
                <AppScreenTitle title="Settings" />

                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack space="lg" className="pb-24">
                        <VStack space="sm">
                            <Text size="xs" className="text-typography-500 uppercase tracking-wider font-bold px-1">Data Portability</Text>
                            <Card className="bg-surface-elevated border-0 p-0 overflow-hidden">
                                <VStack>
                                    <Pressable onPress={handleExport} disabled={loading} android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}>
                                        <HStack className="p-4 items-center justify-between border-b border-outline-dark/5">
                                            <HStack space="md" className="items-center">
                                                <Box className="p-2 bg-primary-energy/10 rounded-lg">
                                                    <Icon as={DownloadIcon} size="sm" className="text-primary-energy" />
                                                </Box>
                                                <VStack>
                                                    <Text className="text-typography-900 font-medium">Export Data</Text>
                                                    <Text size="xs" className="text-typography-500">Save all data to a JSON file</Text>
                                                </VStack>
                                            </HStack>
                                            <Icon as={ChevronRightIcon} size="xs" className="text-typography-400" />
                                        </HStack>
                                    </Pressable>

                                    <Pressable onPress={handleImport} disabled={loading} android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}>
                                        <HStack className="p-4 items-center justify-between">
                                            <HStack space="md" className="items-center">
                                                <Box className="p-2 bg-background-100 rounded-lg">
                                                    <Icon as={UploadIcon} size="sm" className="text-typography-500" />
                                                </Box>
                                                <VStack>
                                                    <Text className="text-typography-900 font-medium">Import Data</Text>
                                                    <Text size="xs" className="text-typography-500">Restore or merge from JSON backup</Text>
                                                </VStack>
                                            </HStack>
                                            <Icon as={ChevronRightIcon} size="xs" className="text-typography-400" />
                                        </HStack>
                                    </Pressable>
                                </VStack>
                            </Card>
                        </VStack>

                        <VStack space="sm">
                            <Text size="xs" className="text-typography-500 uppercase tracking-wider font-bold px-1">Developer Tools</Text>
                            <Card className="bg-surface-elevated border-0 p-0 overflow-hidden">
                                <Pressable onPress={() => router.push('/components-gallery')} android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}>
                                    <HStack className="p-4 items-center justify-between">
                                        <HStack space="md" className="items-center">
                                            <Box className="p-2 bg-primary-energy/10 rounded-lg">
                                                <Icon as={LayoutIcon} size="sm" className="text-primary-energy" />
                                            </Box>
                                            <VStack>
                                                <Text className="text-typography-900 font-medium">Components Gallery</Text>
                                                <Text size="xs" className="text-typography-500">Visual test library for our custom components</Text>
                                            </VStack>
                                        </HStack>
                                        <Icon as={ChevronRightIcon} size="xs" className="text-typography-400" />
                                    </HStack>
                                </Pressable>
                            </Card>
                        </VStack>

                        <VStack space="sm">
                            <Text size="xs" className="text-typography-500 uppercase tracking-wider font-bold px-1">About</Text>
                            <Card className="bg-surface-elevated border-0 p-4">
                                <VStack space="md">
                                    <HStack space="md" className="items-center">
                                        <Box className="p-2 bg-background-100 rounded-lg">
                                            <Icon as={InfoIcon} size="sm" className="text-typography-500" />
                                        </Box>
                                        <VStack>
                                            <Text className="text-typography-950 font-bold">Gym Tracker v2.0</Text>
                                            <Text size="xs" className="text-typography-500 font-medium">Offline-first training companion</Text>
                                        </VStack>
                                    </HStack>
                                    <HStack space="md" className="items-center">
                                        <Icon as={ShieldCheckIcon} size="sm" className="text-success-500" />
                                        <Text size="sm" className="text-typography-400">Your data is stored locally on this device.</Text>
                                    </HStack>
                                </VStack>
                            </Card>
                        </VStack>

                        <VStack space="sm">
                            <Text size="xs" className="text-error-500 uppercase tracking-wider font-bold px-1">Danger Zone</Text>
                            <Card className="bg-surface-elevated border border-error-500/20 p-0 overflow-hidden">
                                <Pressable onPress={() => setShowDeleteConfirmAlert(true)} disabled={loading} android_ripple={{ color: 'rgba(239, 68, 68, 0.1)' }}>
                                    <HStack className="p-4 items-center justify-between">
                                        <HStack space="md" className="items-center">
                                            <Box className="p-2 bg-error-500/10 rounded-lg">
                                                <Icon as={Trash2Icon} size="sm" className="text-error-500" />
                                            </Box>
                                            <VStack>
                                                <Text className="text-error-500 font-medium">Delete Database</Text>
                                                <Text size="xs" className="text-typography-500">Permanently wipe all records</Text>
                                            </VStack>
                                        </HStack>
                                        <Icon as={ChevronRightIcon} size="xs" className="text-error-500/50" />
                                    </HStack>
                                </Pressable>
                            </Card>
                        </VStack>
                    </VStack>
                </ScrollView>
            </VStack>

            <AppAlert
                isOpen={showExportSuccessAlert}
                onClose={() => setShowExportSuccessAlert(false)}
                title="Export Successful"
                message={`Backup saved to: ${exportFilePath}`}
                buttons={[{ text: "OK" }]}
            />

            <AppAlert
                isOpen={showExportErrorAlert}
                onClose={() => setShowExportErrorAlert(false)}
                title="Export Failed"
                message="There was an error exporting your data."
                buttons={[{ text: "OK" }]}
            />

            <AppAlert
                isOpen={showImportConfirmAlert}
                onClose={() => {
                    setShowImportConfirmAlert(false);
                    setPendingImportData(null);
                }}
                title="Import Data"
                message="This will merge the imported data with your current data. Existing records with the same ID will be updated. Proceed?"
                buttons={[
                    { text: "Cancel", style: "cancel" },
                    { text: "Import", onPress: handleConfirmImport }
                ]}
            />

            <AppAlert
                isOpen={showImportErrorAlert}
                onClose={() => setShowImportErrorAlert(false)}
                title="Import Error"
                message="The file format might be invalid."
                buttons={[{ text: "OK" }]}
            />


            <AppAlert
                isOpen={showActiveWorkoutAlert}
                onClose={() => setShowActiveWorkoutAlert(false)}
                title="Cannot Import Data"
                message="You have an active workout in progress. Please finish or abandon your current workout before importing data."
                buttons={[{ text: "OK" }]}
            />

            <AppAlert
                isOpen={showImportFailedAlert}
                onClose={() => setShowImportFailedAlert(false)}
                title="Import Failed"
                message="Failed to read the selected file."
                buttons={[{ text: "OK" }]}
            />

            <AppAlert
                isOpen={showDeleteConfirmAlert}
                onClose={() => setShowDeleteConfirmAlert(false)}
                title="Delete Everything?"
                message="This will permanently delete all your exercises, programs, and workout history. This action cannot be undone."
                buttons={[
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: handleDeleteDatabase }
                ]}
            />
        </Box>
    );
};
