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



export default function Speedrun() {


    // Code string in editor
    const [codeString, setCodeString] = useState<string>("");

    const editorRef = useRef<AceEditor>(null);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);


    const [startTime, setStartTime] = useState<number|null>(null);
    const [elapsedTime, setElapsedTime] = useState<number|null>(null);

    const [submittedTime, setSubmittedTime] = useState<number|null>(null);
    const [isExecutingCode, setIsExecutingCode] = useState<boolean>(false);

    // A worker for executing python code in a separate thread
    const [pythonWorker, setPythonWorker] = useState<ModuleThread<PythonWorker>|null>(null);


    useEffect(() => {
        // TODO: fix the references and async stuff so that it actually terminates

        console.log("useeffectdawdaw");

        const initWorker = async () => {
            console.log("importmeta", import.meta.url);

            const worker = await spawn<PythonWorker>(
                new Worker(new URL('@/python/pythonWorker.ts', import.meta.url))
            );

            console.log("Loading worker - host");
            await worker.loadWorker();
            console.log("Load worker done - host");

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



    const executeCode = async () => {
        if (!pythonWorker) throw new Error("Python worker not loaded!");

        // if (pyodide) {
        setSubmittedTime(new Date().getTime());
        setIsExecutingCode(true);

        console.log("Executing codeString", codeString);
        const result = await challengeHelloWorld(pythonWorker, codeString);

        setIsExecutingCode(false);

    }


    const onChange = async (newValue:string) => {
        // console.log("change", newValue);
        setCodeString(newValue);
    };


    const focusEditor = () => {
        console.log("Focusing editor!");

        if (!editorRef.current) {
            throw new Error("No editor ref??");
        }

        editorRef.current.editor.focus();
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


    useEffect(() => {
        console.log("RUNNNIGN EFFECT");

        if (isPlaying) {
            const intervalId = setInterval(() => {
                if (startTime) {
                    setElapsedTime(new Date().getTime() - startTime);
                    // console.log("Setting elapsed time", elapsedTime, startTime);
                }
            }, 1);

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [isPlaying]);


    const startPlaying = () => {

        setStartTime(new Date().getTime());
        setIsPlaying(true);

        focusEditor();
    }


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if Ctrl key is pressed along with Enter key
            if (event.ctrlKey && event.key === 'Enter') {
                if (!isPlaying) {
                    startPlaying();
                } else {
                    executeCode();
                }
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, codeString]);



    return (
        <div className="h-full">


            <div className="h-full flex w-full">

                <div className="flex-1 bg-zinc-800 rounded-md mr-2">


                    <Instructions/>


                </div>

                <div className="flex-1 flex flex-col">
                    {/* RIGHT */}

                    <div className="flex-[2] mb-2 relative flex flex-col bg-zinc-800 rounded-md px-1 pb-1">
                        <div className="text-right p-1 pr-2 text-zinc-500 font-mono">
                            {/* 00:22:02.426 */}

                            { formatTimeElapsed(elapsedTime!) }
                        </div>

                        <div className="w-full h-full">
                            <AceEditor
                                ref={editorRef}

                                // style={{width:"100%"}}
                                width="100%"
                                height="100%"

                                // Don't have a line to help with line length
                                showPrintMargin={false}


                                mode="python"
                                theme="dracula"
                                onChange={onChange}
                                // name="UNIQUE_ID_OF_DIV"
                                editorProps={{ $blockScrolling: true }}

                                keyboardHandler="vim"

                                // https://codepen.io/zymawy/pen/XwbxoJ
                                setOptions={{
                                    showLineNumbers: true,
                                    enableBasicAutocompletion: true,
                                }}
                            />
                        </div>

                        {
                            !isPlaying && (
                                <div className="w-full h-full absolute inset-0 flex items-center justify-center">
                                    Press Ctrl+Enter to Start.
                                </div>
                            )
                        }

                    </div>

                    <div className="flex-[1] bg-zinc-800 rounded-md p-4">
                        {/* TODO: Maybe have an overlay here which says press Ctrl+Enter to submit (maybe change the start hotkey also) */}

                        <h2>results</h2>

                        <button onClick={executeCode} className="mt-4 p-2 bg-blue-500 text-white rounded">Execute Code</button>

                        <button onClick={focusEditor} className="mt-4 p-2 bg-blue-500 text-white rounded">Focus Editor</button>

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
