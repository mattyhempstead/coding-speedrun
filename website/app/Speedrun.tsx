"use client";

import React, { useState, useEffect } from "react";
import Script from 'next/script';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";  // light theme
import "ace-builds/src-noconflict/theme-monokai";  // dark theme (bad)
import "ace-builds/src-noconflict/theme-dracula";  // dark theme
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim";
import "ace-builds/src-noconflict/keybinding-vscode";


import { PyodideInterface } from "pyodide";

import Instructions from './Instructions';




export default function Speedrun() {

    // State to store the Pyodide instance
    const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);

    // Code string in editor
    const [codeString, setCodeString] = useState<string>("");



    // Function to load Pyodide
    const loadPyodideHandler = async () => {
        if (!pyodide) {
            console.log("Loading Pyodide.");
            const loadedPyodide: PyodideInterface = await (window as any).loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
            });
            setPyodide(loadedPyodide);
            console.log("Loaded Pyodide.");
        }
    };


    const executeCode = async () => {
        if (pyodide) {
            let res = await pyodide.runPythonAsync(codeString);
            console.log("RES", res);
        } else {
            throw new Error("pyodide not loaded!");
        }
    }


    const onChange = async (newValue:string) => {
        console.log("change", newValue);
        setCodeString(newValue);
    };



    return (
        <div className="h-full">

            <Script 
                src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
                onLoad={loadPyodideHandler}
            />

            <div className="h-full flex w-full">

                <div className="flex-1 bg-zinc-800 rounded-md mr-2">


                    <Instructions/>

                </div>

                <div className="flex-1 flex flex-col">
                    {/* RIGHT */}

                    <div className="flex-[2]">
                        {/* <h2>editor</h2> */}
                        <div className="w-full h-full border-black">
                            <AceEditor
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
                                    enableLiveAutocompletion: true,

                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-[1] bg-zinc-800 rounded-md">
                        <h2>results</h2>
                        <button onClick={executeCode} className="mt-4 p-2 bg-blue-500 text-white rounded">Execute Code</button>
                    </div>


                </div>

            </div>

        </div>
    )
}
