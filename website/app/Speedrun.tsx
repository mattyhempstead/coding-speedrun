"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Script from 'next/script';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";  // light theme
import "ace-builds/src-noconflict/theme-monokai";  // dark theme (bad)
import "ace-builds/src-noconflict/theme-dracula";  // dark theme
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim";
import "ace-builds/src-noconflict/keybinding-vscode";



import Instructions from './Instructions';


import { ModuleThread, spawn, Thread } from 'threads';
import { PythonWorker } from "@/python/pythonWorker";


import { challengeHelloWorld } from "@/challenges/challenges";

import { useInterval, useEventListener } from 'usehooks-ts';



export default function Speedrun() {


    // Code string in editor
    const [codeString, setCodeString] = useState<string>("");

    // Reference to code editor
    // Needed so we can .focus() it
    const editorRef = useRef<AceEditor>(null);


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


    const isLoading = (pythonWorker != null);



    useEffect(() => {


        // TODO: fix the references and async stuff so that it actually terminates
        console.log("useeffectdawdaw");

        const initWorker = async () => {
            console.log("importmeta", import.meta.url);

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


    const focusEditor = () => {
        console.log("Focusing editor.");
        if (!editorRef.current) throw new Error("No editor ref??");
        editorRef.current.editor.focus();
    };


    const startPlaying = () => {
        setStartTime(new Date().getTime());
        setSubmittedTime(null);
        setElapsedTime(null);

        setIsPlaying(true);
        focusEditor();
    }



    const executeCode = async () => {
        if (!pythonWorker) throw new Error("Python worker not loaded!");

        // if (pyodide) {
        setSubmittedTime(new Date().getTime());
        setIsExecutingCode(true);

        console.log("Executing codeString", codeString);
        const result = await challengeHelloWorld(pythonWorker, codeString);

        if (result) {
            setIsPassedChallenge(true);
            setIsPlaying(false);
        }

        setIsExecutingCode(false);
    }


    const onChange = async (newValue:string) => {
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
                            <AceEditor
                                ref={editorRef}

                                // style={{width:"100%"}}
                                width="100%"
                                height="100%"

                                // TODO: Make this an options
                                fontSize={18}

                                // Don't have a line to help with line length
                                showPrintMargin={false}

                                mode="python"
                                theme="dracula"
                                onChange={onChange}
                                // name="UNIQUE_ID_OF_DIV"
                                editorProps={{ $blockScrolling: true }}

                                keyboardHandler="vim"
                                // keyboardHandler="vscode"

                                // https://codepen.io/zymawy/pen/XwbxoJ
                                setOptions={{
                                    showLineNumbers: true,
                                    enableBasicAutocompletion: true,
                                }}
                            />


                            {
                                !isPlaying && (
                                    <div className="w-full h-full absolute inset-0 flex flex-col gap-6 items-center justify-center">
                                        <div>
                                            <button
                                                onClick={startPlaying}
                                                className="py-2 px-4 bg-green-600 text-white rounded"
                                                title="Click me to start the programming challenge."
                                            >Start Challenge</button>
                                        </div>

                                        <div className="italic">
                                            OR
                                        </div>

                                        <div className="font-bold text-xl text-zinc-400">
                                            Ctrl + Enter
                                        </div>
                                    </div>
                                )
                            }

                        </div>


                    </div>

                    <div className="flex-[1] bg-zinc-800 rounded-md p-4">
                        {/* TODO: Maybe have an overlay here which says press Ctrl+Enter to submit (maybe change the start hotkey also) */}

                        <h2>results</h2>

                        <button
                            onClick={executeCode}
                            className="mt-4 py-2 px-4 bg-green-600 text-white rounded"
                            title="Hotkey: Ctrl + Enter"
                        >Submit Code</button>

                        <br/>

                        {isExecutingCode && "RUNNING"}

                        {submittedTime && submittedTime}


                       <br/> 

                       {!pythonWorker && <p>LOADING PYTHON EXECUTION ENVIRONMENT.</p>}
                        

                    </div>


                </div>

            </div>

        </div>
    )
}
