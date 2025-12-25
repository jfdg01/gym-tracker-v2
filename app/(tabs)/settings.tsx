import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';

export default function SettingsScreen() {
    return (
        <Box className="flex-1 bg-background-dark p-4">
            <Center className="flex-1">
                <Heading className="text-typography-900">Settings</Heading>
            </Center>
        </Box>
    );
}
