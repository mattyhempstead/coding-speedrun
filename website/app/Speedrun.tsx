"use client";

import React, { useState, useEffect, useCallback } from "react";
import Script from 'next/script';

import { ModuleThread, spawn, Thread } from 'threads';
import { PythonWorker } from "@/python/pythonWorker";
import { useEventListener } from 'usehooks-ts';

import { CHALLENGE_TESTS } from "@/challenges/challenges";
import { useChallengeSubmissionHistory } from "@/submissions/submissions";

import CodeEditor from "./CodeEditor";
import Instructions from './Instructions';
import SubmissionHistoryPane from "./SubmissionHistoryPane";
import Timer from "./Timer";
import Dropdown from "@/components/Dropdown";


export default function Speedrun() {


    // Code string in editor
    const [codeString, setCodeString] = useState<string>("");

    // Keyboard mode: either "vscode" (regular) or "vim"
    const [editorKeyboardMode, setEditorKeyboardMode] = useState<string>("vscode");



    // A worker for executing python code in a separate thread
    const [pythonWorker, setPythonWorker] = useState<ModuleThread<PythonWorker>|null>(null);



    // True if user is currently writing code for a challenge
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const [isPassedChallenge, setIsPassedChallenge] = useState<boolean>(false);

    // Unix time in ms that challenge was started
    const [startTime, setStartTime] = useState<number|null>(null);

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


    const challengeTests = CHALLENGE_TESTS["hello-world"];


    const {challengeSubmissions, addChallengeSubmission} = useChallengeSubmissionHistory("hello-world");
    // console.log(challengeSubmissions);



    const isLoading = (pythonWorker == null);



    useEffect(() => {


        // TODO: fix the references and async stuff so that it actually terminates
        console.log("Creating pyodide worker.");

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

        setIsPlaying(true);
        setResultsMessage("");
    }

    const giveUp = () => {
        setIsPassedChallenge(false);
        setIsPlaying(false);
        setResultsMessage("Challenge abandoned.");

        // addChallengeSubmission({
        //     success: false,
        //     duration: null,
        //     timestamp: new Date().getTime(),
        // });
    }


    const executeCode = async () => {
        if (!pythonWorker) throw new Error("Python worker not loaded!");

        // if (pyodide) {

        const submittedTimeTemp = new Date().getTime();

        setSubmittedTime(submittedTimeTemp);
        setIsExecutingCode(true);

        setResultsMessage("Running tests...");

        console.log("Executing codeString", codeString);

        let result = true;
        for (let testCase of challengeTests) {
            const resultTest = await testCase.function(pythonWorker, codeString);
            if (!resultTest) {
                console.log("Failed test case:", testCase.name);
                result = false;
            } else {
                console.log("Passed test case:", testCase.name);
            }
        }

        if (result) {
            setIsPassedChallenge(true);
            setIsPlaying(false);
            setResultsMessage("Tests passed.");

            addChallengeSubmission({
                success: true,
                duration: submittedTimeTemp - startTime!,
                timestamp: new Date().getTime(),
                charCount: codeString.length,
            });

        } else {
            setResultsMessage("Tests failed.");
        }


        setIsExecutingCode(false);
    }


    const onCodeChange = (newValue:string) => {
        // console.log("change", newValue);
        setCodeString(newValue);
    };



    useEventListener('keydown', (event: KeyboardEvent) => {
        // Check if Ctrl key is pressed along with Enter key
        // console.log("keyevent", event);

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


    const buttonDisabledSubmitCode = (isExecutingCode || !isPlaying);
    const buttonDisabledGiveUp = (!isPlaying);


    return (
        <div className="h-full">

            <div className="h-full flex w-full">

                <div className="flex-1 mr-2">
                    <div className="bg-zinc-800 rounded-md mb-2 h-[60%]">
                        <Instructions/>
                    </div>
                    <div className="bg-zinc-800 rounded-md h-[40%]">
                        <SubmissionHistoryPane challengeId="hello-world"/>
                    </div>
                </div>

                {/* <div className="flex-1 bg-zinc-800 rounded-md mr-2">
                    <Instructions/>
                </div> */}

                <div className="flex-1">
                    {/* RIGHT */}

                    <div className="h-[60%] mb-2 flex flex-col bg-zinc-800 rounded-md px-1">
                        <div className="flex justify-between py-1">

                            <div className="grow flex flex-col justify-center pl-2 text-sm text-zinc-400">
                                {resultsMessage}
                            </div>

                            <div className="text-right p-1 pr-2 text-zinc-500 font-mono">
                                <Timer
                                    startTime={startTime}
                                    submittedTime={submittedTime}
                                    isExecutingCode={isExecutingCode}
                                    isPassedChallenge={isPassedChallenge}
                                    isPlaying={isPlaying}
                                />
                            </div>
                        </div>

                        <div className="w-full h-full relative">
                            <div className={`w-full h-full ${isLoading && "invisible"}`}>
                                <CodeEditor onChange={onCodeChange} enabled={isPlaying} keyboardMode={editorKeyboardMode}/>
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

                        <div className="py-2 px-1 text-right">
                            <div title="The keyboard mode (only use vim mode if you know what you are doing)">
                                <Dropdown
                                    options={[
                                        {value:"vscode", label:"Default Keyboard"},
                                        {value:"vim", label:"Vim Mode"},
                                    ]}
                                    // onChange={(value) => console.log("new value", value)}
                                    onChange={setEditorKeyboardMode}
                                    defaultValue={editorKeyboardMode}
                                />
                            </div>
                        </div>

                    </div>


                    <div className="h-[40%] bg-zinc-800 rounded-md p-4">

                        {isLoading ? <>
                            <div className="text-lg font-bold italic text-center">
                                Loading Python environment...
                            </div>
                        </> : <>
                            <div className="w-full h-full flex flex-col items-stretch">
                                {/* TODO: Maybe have an overlay here which says press Ctrl+Enter to submit (maybe change the start hotkey also) */}

                                <h2 className="text-xl font-bold mb-4">Test Cases</h2>

                                <div className="grow overflow-y-auto mb-4 bg-zinc-900 rounded-lg">
                                    {/* {isExecutingCode && "Running test cases..."} */}

                                    {/* {submittedTime && submittedTime} */}

                                    {challengeTests.map((testCase, index) => (
                                        <div className="p-2 border-b-[1px] border-zinc-500" key={testCase.name}>
                                            <details>
                                                <summary className="pl-1 font-bold text-zinc-400 cursor-pointer">
                                                    <span className="text-zinc-500 font-mono text-lg">{index+1}.</span> {testCase.name}
                                                </summary>
                                                <div className="p-2">
                                                    <p>
                                                        dwadwada
                                                    </p>
                                                </div>
                                            </details>
                                        </div>
                                    ))}
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
