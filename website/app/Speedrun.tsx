"use client";

import React, { useState, useEffect, useCallback } from "react";
import Script from 'next/script';


import Instructions from './Instructions';


import { ModuleThread, spawn, Thread } from 'threads';
import { PythonWorker } from "@/python/pythonWorker";


import { challengeHelloWorld } from "@/challenges/challenges";

import { useInterval, useEventListener } from 'usehooks-ts';
import CodeEditor from "./CodeEditor";



export default function Speedrun() {


    // Code string in editor
    const [codeString, setCodeString] = useState<string>("");


    // A worker for executing python code in a separate thread
    const [pythonWorker, setPythonWorker] = useState<ModuleThread<PythonWorker>|null>(null);



    // True if user is currently writing code for a challenge
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const [isPassedChallenge, setIsPassedChallenge] = useState<boolean>(false);

    // Unix time in ms that challenge was started
    const [startTime, setStartTime] = useState<number|null>(null);

    // While playing, is dynamically updated to reflect ms since challenge was started
    const [elapsedTime, setElapsedTime] = useState<number|null>(null);

    // Unix time in ms that code was submitted for challenge
    const [submittedTime, setSubmittedTime] = useState<number|null>(null);

    // True if code has been submitted but still executing and so test cases result unknown
    const [isExecutingCode, setIsExecutingCode] = useState<boolean>(false);


    // Buttons
    // "Game abandoned."
    // "Running tests."
    // "All tests passed."
    // "X/Y tests passed."
    const [resultsMessage, setResultsMessage] = useState<string>("...");


    const isLoading = (pythonWorker == null);



    useEffect(() => {


        // TODO: fix the references and async stuff so that it actually terminates
        console.log("useeffectdawdaw");

        const initWorker = async () => {
            console.log("import.meta.url", import.meta.url);

            const worker = await spawn<PythonWorker>(
                new Worker(new URL('@/python/pythonWorker.ts', import.meta.url))
            );

            // console.log("Loading worker - host");
            // await worker.loadWorker();
            // console.log("Load worker done - host");

            setPythonWorker(worker);
        }
        initWorker();

        return () => {
            const terminateWorker = async () => {
                console.log("Terminating worker");
                // workerRef.current?.terminate();
                if (pythonWorker) {
                    console.log("TERMINATE YES");
                    await Thread.terminate(pythonWorker);
                }
            }
            terminateWorker();
        }
    }, []);


    const startPlaying = () => {
        setStartTime(new Date().getTime());
        setSubmittedTime(null);
        setElapsedTime(null);

        setIsPlaying(true);
        setResultsMessage("");
    }

    const giveUp = () => {
        setIsPassedChallenge(false);
        setIsPlaying(false);
        setResultsMessage("Challenge abandoned.");
    }


    const executeCode = async () => {
        if (!pythonWorker) throw new Error("Python worker not loaded!");

        // if (pyodide) {
        setSubmittedTime(new Date().getTime());
        setIsExecutingCode(true);

        setResultsMessage("Running tests...");

        console.log("Executing codeString", codeString);
        const result = await challengeHelloWorld(pythonWorker, codeString);

        if (result) {
            setIsPassedChallenge(true);
            setIsPlaying(false);
            setResultsMessage("Tests passed.");
        } else {
            setResultsMessage("Tests failed.");
        }
        

        setIsExecutingCode(false);
    }


    const onCodeChange = (newValue:string) => {
        // console.log("change", newValue);
        setCodeString(newValue);
    };




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


    useInterval(() => {
        if (!startTime) throw new Error("isPlaying=true but startTime is not set?");

        const elapsedTimeNew = new Date().getTime() - startTime;
        setElapsedTime(elapsedTimeNew);
        // console.log("Setting elapsed time", elapsedTimeNew, startTime);

    }, isPlaying ? 1 : null);


    useEventListener('keydown', (event: KeyboardEvent) => {
        // Check if Ctrl key is pressed along with Enter key

        if (event.ctrlKey && event.key === 'Enter') {
            if (!isPlaying) {
                startPlaying();
            } else {
                executeCode();
            }
        }

        if (event.ctrlKey && event.key === '.') {
            if (isPlaying) {
                giveUp();
            }
        }
    });




    const getTimerElement = () => {

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



    const buttonDisabledSubmitCode = (isExecutingCode || !isPlaying);
    const buttonDisabledGiveUp = (!isPlaying);


    return (
        <div className="h-full">


            <div className="h-full flex w-full">

                <div className="flex-1 bg-zinc-800 rounded-md mr-2">


                    <Instructions/>


                </div>

                <div className="flex-1 flex flex-col">
                    {/* RIGHT */}

                    <div className="flex-[2] mb-2 flex flex-col bg-zinc-800 rounded-md px-1 pb-1">
                        <div className="text-right p-1 pr-2 text-zinc-500 font-mono">
                            {/* 00:22:02.426 */}
                            {getTimerElement()}
                        </div>

                        <div className="w-full h-full relative">
                            <div className={`w-full h-full ${isLoading && "invisible"}`}>
                                <CodeEditor onChange={onCodeChange} enabled={isPlaying}/>
                            </div>

                            {!isPlaying && (
                                <div className="w-full h-full absolute inset-0 flex flex-col gap-6 items-center justify-center z-10 bg-zinc-800 bg-opacity-50">
                                    {isLoading ? <>
                                        <div className="text-lg font-bold italic">Loading Python environment...</div>
                                    </> : <>
                                        <div>

                                            <button
                                                onClick={startPlaying}
                                                className="py-2 px-4 bg-green-600 text-white rounded-lg"
                                                title="Click me to start the programming challenge."
                                            >Start Challenge</button>

                                            <div className="text-center text-zinc-500 text-sm mt-2">
                                                (Ctrl + Enter)
                                            </div>
                                        </div>

                                        {/* <div className="italic">
                                            OR
                                        </div>

                                        <div className="font-bold text-xl text-zinc-400">
                                            Ctrl + Enter
                                        </div> */}
                                    </>
                                    }
                                </div>
                            )}
                        </div>

                    </div>


                    <div className="flex-[1] bg-zinc-800 rounded-md p-4">

                        {isLoading ? <>
                            <div className="text-lg font-bold italic text-center">
                                Loading Python environment...
                            </div>
                        </> : <>
                            <div className="w-full h-full flex flex-col items-stretch">
                                {/* TODO: Maybe have an overlay here which says press Ctrl+Enter to submit (maybe change the start hotkey also) */}

                                <h2 className="text-xl font-bold mb-4">Test Cases</h2>

                                <div className="grow">
                                    {isExecutingCode && "Running test cases..."}

                                    {submittedTime && submittedTime}
                                </div>


                                <div className="flex justify-between">

                                    <div className="grow flex flex-col justify-end">
                                        {resultsMessage}
                                    </div>

                                    {<>
                                        <div className="mr-6">
                                            <div className="text-center text-zinc-500 text-sm mb-1">
                                                (Ctrl + .)
                                            </div>

                                            <button
                                                onClick={giveUp}
                                                className={`
                                                    py-2 px-4  rounded-lg
                                                    ${!buttonDisabledGiveUp && 'bg-zinc-500 text-white'}
                                                    ${buttonDisabledGiveUp && 'cursor-not-allowed bg-zinc-700 text-gray-500'}
                                                `}
                                                title="Ctrl + ."
                                                disabled={buttonDisabledGiveUp}
                                            >Give Up</button>
                                        </div>

                                        <div className="">

                                            <div className="text-center text-zinc-500 text-sm mb-1">
                                                (Ctrl + Enter)
                                            </div>

                                            <button
                                                onClick={executeCode}
                                                className={`
                                                    py-2 px-4 rounded-lg
                                                    ${!buttonDisabledSubmitCode && 'bg-green-600 text-white'}
                                                    ${buttonDisabledSubmitCode && 'cursor-not-allowed bg-green-900 text-gray-500'}
                                                `}
                                                title="Ctrl + Enter"
                                                disabled={buttonDisabledSubmitCode}
                                            >
                                                Submit Code
                                            </button>
                                        </div>
                                    </>}
                                </div>

                            </div>

                        </>}

                    </div>

                </div>

            </div>

        </div>
    )
}
