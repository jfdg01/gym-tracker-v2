import { useLocalSearchParams } from 'expo-router';
import { WorkoutDetailScreen } from '@/src/screens/WorkoutDetailScreen';

export default function WorkoutDetailRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <WorkoutDetailScreen id={id} />;
}
