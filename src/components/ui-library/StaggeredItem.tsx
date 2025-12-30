import React from 'react';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';

interface StaggeredItemProps {
    children: React.ReactNode;
    index: number;
    delay?: number;
    className?: string;
}

/**
 * A reusable wrapper that provides a "premium" staggered entrance animation.
 * Best used inside .map() functions for lists.
 */
export const StaggeredItem = ({
    children,
    index,
    delay = 50,
    className
}: StaggeredItemProps) => {
    // Cap the maximum delay to maintain responsiveness on long lists
    const calculatedDelay = Math.min(index * delay, 400);

    return (
        <Animated.View
            entering={FadeInUp.delay(calculatedDelay).springify().damping(18).stiffness(120)}
            layout={LinearTransition}
            className={className}
        >
            {children}
        </Animated.View>
    );
};
