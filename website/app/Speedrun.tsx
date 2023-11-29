"use client";


import React from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";  // light theme
import "ace-builds/src-noconflict/theme-monokai";  // dark theme (bad)
import "ace-builds/src-noconflict/theme-dracula";  // dark theme
import "ace-builds/src-noconflict/ext-language_tools";

function onChange(newValue:string) {
  console.log("change", newValue);
}



export default function Speedrun() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>


        <div className="border-2 border-black">
            <AceEditor
                mode="python"
                theme="dracula"
                onChange={onChange}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
            />
        </div>


      </div>
    </main>
  )
}
