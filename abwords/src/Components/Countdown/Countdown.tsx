import dayjs from "dayjs";
import React, { useState, useEffect, useCallback } from "react";

interface CountdownProps {
  targetDate: string; 
  onTimeOut: () => void;
  isActive: boolean; 
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}


const Countdown: React.FC<CountdownProps> = ({ targetDate, onTimeOut, isActive }) => {
    const calculateTimeLeft = useCallback(() => {
        if (!targetDate) return null;
        const target = dayjs(targetDate);
        const difference = target.diff(dayjs());
        
        return {
            minutes: Math.max(0, Math.floor((difference / (1000 * 60)) % 60)),
            seconds: Math.max(0, Math.floor((difference / 1000) % 60)),
            totalMs: difference
        };
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!isActive || !targetDate) return;

        // Calculate immediately on mount/update
        const current = calculateTimeLeft();
        
        // --- THE FIX ---
        // If the date is already in the past when the component first sees it,
        // it's likely a stale prop from the previous session. 
        // We ignore it and wait for the new prop.
        if (current && current.totalMs <= 0) {
            return; 
        }

        setTimeLeft(current);

        const timer = setInterval(() => {
            const next = calculateTimeLeft();
            setTimeLeft(next);

            if (next && next.totalMs <= 0) {
                clearInterval(timer);
                onTimeOut();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, targetDate, onTimeOut, calculateTimeLeft]);

    if (!isActive || !targetDate) return null;

    // Avoid flickering "0m 0s" while waiting for the interval to start
    if (!timeLeft || (timeLeft.totalMs <= 0)) {
        return <div className="timer-finished">Waiting for timer...</div>;
    }

    return (
        <div className="timer-display">
            <span>{timeLeft.minutes}m </span>
            <span>{timeLeft.seconds}s</span>
        </div>
    );
};

export default Countdown