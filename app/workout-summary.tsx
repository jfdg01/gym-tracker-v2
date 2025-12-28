import { useLocalSearchParams } from 'expo-router';
import { WorkoutSummaryScreen, WorkoutSummaryParams } from '@/src/screens/WorkoutSummaryScreen';

export default function WorkoutSummaryRoute() {
    const params = useLocalSearchParams();

    // Ensure params match the expected type
    const summaryParams: WorkoutSummaryParams = {
        sessionId: params.sessionId as string,
        progressionEvents: params.progressionEvents as string,
        programName: params.programName as string,
        dayName: params.dayName as string,
        duration: params.duration as string,
        totalSets: params.totalSets as string,
        completedSets: params.completedSets as string
    };

    return <WorkoutSummaryScreen params={summaryParams} />;
}
