// This is a module worker, so we can use imports (in the browser too!)

/*
    TODO: Optimization

    We could implement a system where pyodide is preemptively loaded/resetted in the background.
    After executing, we load pyodide in the background again.
    This would make execution appear instantaneous.

     - Preload pyodide initially
     - When user submits code
        - Use preload pyodide instance
        - Return when execution completes
        - Async reload pyodide just before returning
     - Use some function which blocks until pyodide loads in
       case user submits again before pyodide has loaded



    TODO
        - handle timeout
        - https://pyodide.org/en/stable/usage/keyboard-interrupts.html
            - will probs need to do all of this
            - i think, you send interrupt signals to the python process from the JS thread outside the web worker


*/


import { expose } from 'threads/worker';

import { PyodideInterface } from "pyodide";


// Load and execute the pyodide init script
// This will give us access to loadPyodide
declare const loadPyodide: any;  // Declare existence of loadPyodide from the importScripts
importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

console.log("pythonWebworker.ts")
// console.log("loadPyodide", loadPyodide);


let pyodide: PyodideInterface|null = null;




async function loadWorker() {
    console.log("Loading Pyodide.", new Date().getTime());
    pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });
    console.log("Loaded Pyodide.", new Date().getTime());
}



export interface PythonExecutionError {
    errorType: string;  // The internal error type (e.g. NameError)
    message: string;
    stack: string;
}

export interface PythonExecutionResult {
    status: string;  // success, error, timeout
    outputLines: string[];
    error: null | PythonExecutionError;
}



/**
 * Run python code in pyodide.
 * Returns stdout of program on completion.
 * 
 * TODO: Provide stdin.
 */
async function runPythonAsync(code: string): Promise<PythonExecutionResult> {

    // await new Promise(resolve => setTimeout(() => resolve("some value"), 1000));

    // Reset python environment before every run.
    // This takes a few seconds which is quite annoying.
    // There may be faster ways to do this.
    await loadWorker();

    // Now that we loadWorker inside this function, we can just return worker
    // instead of using the global pyodide below.
    if (!pyodide) throw new Error("Pyodide not loaded");


    // Provide stdin
    // Line below will give "test1" as stdin.
    // pyodide.setStdin({stdin: () => "test1"});

    // Store stdout in outlineLines array
    let outputLines: string[] = [];
    pyodide.setStdout({batched : (msg) => {
        outputLines.push(msg);
    }});


    // Run program
    try {
        await pyodide.runPythonAsync(code);
    } catch (e:any) {
        // Catch errors thrown by python interpreter 
        if (e.name == "PythonError") {
            return {
                status: "error",
                outputLines: outputLines,
                error: {
                    errorType: e.type,
                    message: e.message,
                    stack: e.stack,
                }
            }
        }
    }

    // console.log("Output Lines:", outputLines);

    return {
        status: "success",
        outputLines: outputLines,
        error: null,
    }
}




const pythonWorker = {
    loadWorker,
    runPythonAsync
};


export type PythonWorker = typeof pythonWorker;

expose(pythonWorker);


