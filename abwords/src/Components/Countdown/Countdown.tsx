import dayjs from "dayjs";
import React, { useState, useEffect, useCallback, useRef } from "react";

interface CountdownProps {
    targetDate: string; 
    onTimeOut: () => void;
    isActive: boolean; 
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
    const timeoutCalled = useRef(false);

    useEffect(() => {
        // Reset timeout flag when targetDate changes
        timeoutCalled.current = false;
        
        if (!isActive || !targetDate) {
            return;
        }

        const current = calculateTimeLeft();
        
        if (!current || current.totalMs <= 0) {
            if (!timeoutCalled.current) {
                timeoutCalled.current = true;
                onTimeOut();
            }
            return;
        }

        setTimeLeft(current);

        const timer = setInterval(() => {
            const next = calculateTimeLeft();

            if (!next || next.totalMs <= 0) {
                clearInterval(timer);
                setTimeLeft({ minutes: 0, seconds: 0, totalMs: 0 });
                if (!timeoutCalled.current) {
                    timeoutCalled.current = true;
                    onTimeOut();
                }
            } else {
                setTimeLeft(next);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, isActive, calculateTimeLeft, onTimeOut]);

    if (!isActive || !targetDate) return null;

    if (!timeLeft || timeLeft.totalMs <= 0) {
        return <div className="timer-finished">Session Ended</div>;
    }

    return (
        <div className="timer-display">
            <span>{timeLeft.minutes}m </span>
            <span>{timeLeft.seconds}s</span>
        </div>
    );
};

export default Countdown;