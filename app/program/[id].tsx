import { ProgramDetailScreen } from '@/src/screens/ProgramDetailScreen';
import { useLocalSearchParams } from 'expo-router';

export default function ProgramPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <ProgramDetailScreen id={id} />;
}
