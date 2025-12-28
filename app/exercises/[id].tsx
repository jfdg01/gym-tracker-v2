
import { useLocalSearchParams } from 'expo-router';
import { ExerciseDetailScreen } from '@/src/screens/ExerciseDetailScreen';

export default function Page() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <ExerciseDetailScreen id={id} />;
}
