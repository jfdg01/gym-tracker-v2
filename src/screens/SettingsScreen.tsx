import React, { useState } from 'react';
import { Alert, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import {
    DownloadIcon,
    UploadIcon,
    SettingsIcon,
    InfoIcon,
    ShieldCheckIcon,
    DatabaseIcon,
    ChevronRightIcon
} from 'lucide-react-native';
import { DataPortabilityService } from '@/src/services/DataPortabilityService';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

export const SettingsScreen = () => {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await DataPortabilityService.exportAllData();
            const jsonString = JSON.stringify(data, null, 2);
            const filename = `gym_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = FileSystem.documentDirectory + filename;

            await FileSystem.writeAsStringAsync(fileUri, jsonString, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert("Export Successful", `Backup saved to: ${fileUri}`);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Export Failed", "There was an error exporting your data.");
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

            if (result.canceled) return;

            const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const data = JSON.parse(fileContent);

            Alert.alert(
                "Import Data",
                "This will merge the imported data with your current data. Existing records with the same ID will be updated. Proceed?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Import",
                        onPress: async () => {
                            try {
                                await DataPortabilityService.importData(data);
                                toast.show({
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
                            } catch (err) {
                                console.error(err);
                                Alert.alert("Import Error", "The file format might be invalid.");
                            }
                        }
                    }
                ]
            );
        } catch (e) {
            console.error(e);
            Alert.alert("Import Failed", "Failed to read the selected file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="flex-1 bg-background-dark p-4">
            <VStack space="xl" className="flex-1 mt-8">
                <Heading className="text-typography-900 mb-4">Settings</Heading>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack space="lg" className="pb-24">
                        <VStack space="sm">
                            <Text size="xs" className="text-typography-500 uppercase tracking-wider font-bold px-1">Data Portability</Text>
                            <Card className="bg-surface-elevated border-0 p-0 overflow-hidden">
                                <VStack>
                                    <Pressable onPress={handleExport} disabled={loading}>
                                        <HStack className="p-4 items-center justify-between border-b border-outline-dark/20">
                                            <HStack space="md" className="items-center">
                                                <Box className="p-2 bg-primary-100 rounded-lg">
                                                    <Icon as={DownloadIcon} size="sm" className="text-primary-600" />
                                                </Box>
                                                <VStack>
                                                    <Text className="text-typography-900 font-medium">Export Data</Text>
                                                    <Text size="xs" className="text-typography-500">Save all data to a JSON file</Text>
                                                </VStack>
                                            </HStack>
                                            <Icon as={ChevronRightIcon} size="xs" className="text-typography-400" />
                                        </HStack>
                                    </Pressable>

                                    <Pressable onPress={handleImport} disabled={loading}>
                                        <HStack className="p-4 items-center justify-between">
                                            <HStack space="md" className="items-center">
                                                <Box className="p-2 bg-secondary-100 rounded-lg">
                                                    <Icon as={UploadIcon} size="sm" className="text-secondary-600" />
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
                            <Text size="xs" className="text-typography-500 uppercase tracking-wider font-bold px-1">About</Text>
                            <Card className="bg-surface-elevated border-0 p-4">
                                <VStack space="md">
                                    <HStack space="md" className="items-center">
                                        <Icon as={InfoIcon} size="sm" className="text-typography-400" />
                                        <VStack>
                                            <Text className="text-typography-900 font-medium">Gym Tracker v2.0</Text>
                                            <Text size="xs" className="text-typography-500">Offline-first training companion</Text>
                                        </VStack>
                                    </HStack>
                                    <HStack space="md" className="items-center">
                                        <Icon as={ShieldCheckIcon} size="sm" className="text-success-500" />
                                        <Text size="sm" className="text-typography-400">Your data is stored locally on this device.</Text>
                                    </HStack>
                                </VStack>
                            </Card>
                        </VStack>
                    </VStack>
                </ScrollView>
            </VStack>
        </Box>
    );
};

import { Pressable } from 'react-native';
