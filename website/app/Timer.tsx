"use client";

import React, { useState, useEffect } from "react";

import { useInterval } from 'usehooks-ts';


/*
    - show live or not
*/


interface TimerProps {
    startTime: number | null;
    submittedTime: number | null;

    isPlaying: boolean;
    isExecutingCode: boolean;
    isPassedChallenge: boolean;
};


export default function Timer({ startTime, submittedTime, isPlaying, isExecutingCode, isPassedChallenge }: TimerProps) {


    // While playing, is dynamically updated to reflect ms since challenge was started
    const [elapsedTime, setElapsedTime] = useState<number|null>(null);


    useInterval(() => {
        if (!startTime) {
            setElapsedTime(null);
        } else {
            const elapsedTimeNew = new Date().getTime() - startTime;
            setElapsedTime(elapsedTimeNew);
            // console.log("Setting elapsed time", elapsedTimeNew, startTime);
        }
    }, 1);



    const formatTimeElapsed = (milliseconds: number): string => {
        // Calculate total minutes without limiting to 60
        const totalMinutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        const millis = milliseconds % 1000;

        // Padding for display
        const paddedMinutes = totalMinutes.toString().padStart(2, '0');
        const paddedSeconds = seconds.toString().padStart(2, '0');
        const paddedMillis = millis.toString().padStart(3, '0');

        return `${paddedMinutes}:${paddedSeconds}.${paddedMillis}`;
    }



    /* e.g. 122:02.426 */

    if (isPlaying) {
        if (isExecutingCode) {
            return <span className="text-yellow-600">
                {formatTimeElapsed(submittedTime! - startTime!)}
            </span>
        } else {
            return <span>
                {formatTimeElapsed(elapsedTime!)}
            </span>
        }
    } else {
        if (isPassedChallenge) {
            return <span className="text-green-600">
                {formatTimeElapsed(submittedTime! - startTime!)}
            </span>
        } else {
            return <span>
                00:00.000
            </span>
        }
    }

}




