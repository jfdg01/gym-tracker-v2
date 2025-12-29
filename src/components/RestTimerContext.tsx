import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Vibration, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

// Configure notifications: don't show when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

interface RestTimerContextType {
    timeLeft: number;
    initialTime: number;
    endTime: number | null;
    isActive: boolean;
    startTimer: (seconds: number) => void;
    stopTimer: () => void;
}

const RestTimerContext = createContext<RestTimerContextType | undefined>(undefined);

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [initialTime, setInitialTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [endTime, setEndTime] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const notificationIdRef = useRef<string | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }
        })();
    }, []);

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const playSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/bell.mp3')
            ).catch(() => ({ sound: null }));

            if (sound) {
                await sound.playAsync();
            }
        } catch (error) {
            console.log("Error playing sound", error);
        }
    };

    const stopTimer = useCallback(async () => {
        setIsActive(false);
        setEndTime(null);
        setTimeLeft(0);
        setInitialTime(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (notificationIdRef.current) {
            await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
            notificationIdRef.current = null;
        }
    }, []);

    const handleTimerComplete = useCallback(async () => {
        await stopTimer();

        const isForeground = AppState.currentState === 'active';

        if (isForeground) {
            Vibration.vibrate([0, 500, 200, 500]);
            await playSound();
        }
        // Notification is already scheduled for background, so we don't need to do anything else here
        // except ensure the UI is reset (which stopTimer does).
    }, [stopTimer]);

    const startTimer = useCallback(async (seconds: number) => {
        if (seconds <= 0) {
            await stopTimer();
            return;
        }

        // Cancel existing notification
        if (notificationIdRef.current) {
            await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
        }

        const newEndTime = Date.now() + seconds * 1000;
        setEndTime(newEndTime);
        setTimeLeft(seconds);
        setInitialTime(seconds);
        setIsActive(true);

        // Schedule background notification
        notificationIdRef.current = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Rest Finished!",
                body: "Time to start your next set.",
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: { url: '/active-workout' },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: seconds,
            },
        });
    }, [stopTimer]);

    // Handle timer tick
    useEffect(() => {
        if (isActive && endTime) {
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

                setTimeLeft(remaining);

                if (remaining <= 0) {
                    handleTimerComplete();
                }
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, endTime, handleTimerComplete]);

    // Handle AppState changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active' && isActive && endTime) {
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
                setTimeLeft(remaining);
                if (remaining <= 0) {
                    handleTimerComplete();
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [isActive, endTime, handleTimerComplete]);

    return (
        <RestTimerContext.Provider value={{ timeLeft, initialTime, endTime, isActive, startTimer, stopTimer }}>
            {children}
        </RestTimerContext.Provider>
    );
};

export const useRestTimer = () => {
    const context = useContext(RestTimerContext);
    if (!context) {
        throw new Error('useRestTimer must be used within a RestTimerProvider');
    }
    return context;
};
