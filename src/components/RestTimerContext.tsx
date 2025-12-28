import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Vibration, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

// Configure notifications to show even when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

interface RestTimerContextType {
    timeLeft: number;
    isActive: boolean;
    startTimer: (seconds: number) => void;
    stopTimer: () => void;
}

const RestTimerContext = createContext<RestTimerContextType | undefined>(undefined);

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);

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
                require('../../assets/sounds/bell.mp3')
                // TODO: Add 'bell.mp3' asset to project.
                // NOTE: Currently fails gracefully if file missing; relies on notification sound.
            ).catch(() => ({ sound: null }));

            if (sound) {
                await sound.playAsync();
            }
        } catch (error) {
            // TODO: Add robust error logging.
            console.log("Error playing sound", error);
        }
    };

    const stopTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startTimer = useCallback((seconds: number) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setTimeLeft(seconds);
        setIsActive(true);
    }, []);

    const handleTimerComplete = async () => {
        stopTimer();
        Vibration.vibrate([0, 500, 200, 500]);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Rest Finished!",
                body: "Time to start your next set.",
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // null means show immediately
        });
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            // Should already be stopped but just in case
            stopTimer();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [isActive, timeLeft, stopTimer]);

    return (
        <RestTimerContext.Provider value={{ timeLeft, isActive, startTimer, stopTimer }}>
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
