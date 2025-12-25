import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

export default function HomeScreen() {
    return (
        <Box className="flex-1 bg-background-dark p-4">
            <Center className="flex-1">
                <Heading className="text-typography-900">Workout</Heading>
                <Text className="text-typography-500 mt-2">Active session or quick start will go here.</Text>
            </Center>
        </Box>
    );
}
