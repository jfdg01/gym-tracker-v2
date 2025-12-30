import { useState, useCallback, useEffect } from 'react';
import { WorkoutService } from '../services/WorkoutService';
import { WorkoutSession, WorkoutSet, ExerciseSnapshotItem, WorkoutStatus } from '../types/domain';
import { Logger } from '../utils/Logger';

export const useWorkout = () => {
    const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
    const [sessionSets, setSessionSets] = useState<WorkoutSet[]>([]);
    const [loading, setLoading] = useState(true);

    const loadActiveSession = useCallback(async () => {
        const stopTimer = Logger.getTimer('Hook: useWorkout.loadActiveSession');
        setLoading(true);
        try {
            const session = await WorkoutService.getActiveSession();
            if (session) {
                setActiveSession(session);
                const sets = await WorkoutService.getSetsForSession(session.id);
                setSessionSets(sets);
            } else {
                setActiveSession(null);
                setSessionSets([]);
            }
        } catch (e) {
            console.error('Failed to load active session', e);
        } finally {
            setLoading(false);
            stopTimer();
        }
    }, []);

    useEffect(() => {
        loadActiveSession();
    }, [loadActiveSession]);

    const startWorkout = async (programDayId: string) => {
        const stopTimer = Logger.getTimer('Hook: useWorkout.startWorkout');
        const session = await WorkoutService.startWorkout(programDayId);
        setActiveSession(session);
        setSessionSets([]);
        stopTimer();
        return session;
    };

    const logSet = async (setData: Omit<WorkoutSet, 'id' | 'createdAt' | 'workoutSessionId'>) => {
        if (!activeSession) return;

        const { set: newSet, progression } = await WorkoutService.logSet({
            ...setData,
            workoutSessionId: activeSession.id,
        });

        setSessionSets(prev => {
            const index = prev.findIndex(s => s.exerciseId === setData.exerciseId && s.setNumber === setData.setNumber);
            if (index !== -1) {
                const copy = [...prev];
                copy[index] = newSet;
                return copy;
            }
            return [...prev, newSet].sort((a, b) => a.setNumber - b.setNumber);
        });

        return { set: newSet, progression };
    };

    const completeWorkout = async (sessionId?: string) => {
        const idToComplete = sessionId || activeSession?.id;
        if (!idToComplete) return;

        await WorkoutService.completeWorkout(idToComplete);

        if (activeSession?.id === idToComplete) {
            setActiveSession(null);
            setSessionSets([]);
        }
    };

    const abandonWorkout = async () => {
        if (!activeSession) return;
        await WorkoutService.abandonWorkout(activeSession.id);
        setActiveSession(null);
        setSessionSets([]);
    };

    return {
        activeSession,
        sessionSets,
        loading,
        startWorkout,
        logSet,
        completeWorkout,
        abandonWorkout,
        refresh: loadActiveSession,
    };
};
