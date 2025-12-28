import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';

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

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopTimer();
                        // TODO: Implement Expo Notifications and sound feedback for timer completion.
                        Vibration.vibrate([0, 500, 200, 500]);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0) {
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
