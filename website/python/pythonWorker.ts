// This is a module worker, so we can use imports (in the browser too!)

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



/**
 * Run python code in pyodide.
 * Returns stdout of program on completion.
 * 
 * TODO: Provide stdin.
 */
async function runPythonAsync(code: string): Promise<string[]> {
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
    let res = await pyodide.runPythonAsync(code);
    // console.log("RES", res);

    // console.log("Output Lines:", outputLines);

    return outputLines;
}




const pythonWorker = {
    loadWorker,
    runPythonAsync
};


export type PythonWorker = typeof pythonWorker;

expose(pythonWorker);


