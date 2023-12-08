import { useRef, useEffect } from "react";


import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";  // light theme
import "ace-builds/src-noconflict/theme-monokai";  // dark theme (bad)
import "ace-builds/src-noconflict/theme-dracula";  // dark theme
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim";
import "ace-builds/src-noconflict/keybinding-vscode";


interface CodeEditorProps {
    enabled: boolean;
    onChange: (newValue:string) => void;
}


export default function CodeEditor({ enabled, onChange }: CodeEditorProps) {

    // Reference to code editor
    // Needed so we can .focus() and .blur() it
    const editorRef = useRef<AceEditor>(null);


    const enableAndFocusEditor = () => {
        /* Enable the editor, make cursor visible, and then focus */
        console.log("Focusing editor.");
        if (!editorRef.current) throw new Error("No editor ref??");
        editorRef.current.editor.setReadOnly(false);
        editorRef.current.editor.setHighlightActiveLine(true);
        editorRef.current.editor.setHighlightGutterLine(true);
        (editorRef.current.editor.renderer as any).$cursorLayer.element.style.opacity=1;
        editorRef.current.editor.focus();
    };

    const disableAndBlurEditor = () => {
        /* Disable the editor, make cursor invisible, and then un-focus/blur */
        console.log("Disabling editor.");
        if (!editorRef.current) throw new Error("No editor ref??");
        editorRef.current.editor.setReadOnly(true);
        editorRef.current.editor.setHighlightActiveLine(false);
        editorRef.current.editor.setHighlightGutterLine(false);
        (editorRef.current.editor.renderer as any).$cursorLayer.element.style.opacity=0;
        editorRef.current.editor.blur();
    };


    // UseEffect hook to watch the enabled prop
    useEffect(() => {
        if (enabled) {
            enableAndFocusEditor();
        } else {
            disableAndBlurEditor();
        }
    }, [enabled])


    return <AceEditor
        ref={editorRef}

        width="100%"
        height="100%"

        // TODO: Make this an options
        fontSize={18}

        // Don't have a line to help with line length
        showPrintMargin={false}

        mode="python"
        theme="dracula"

        // name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}

        keyboardHandler="vim"
        // keyboardHandler="vscode"

        // https://codepen.io/zymawy/pen/XwbxoJ
        setOptions={{
            showLineNumbers: true,
            enableBasicAutocompletion: true,
        }}

        onChange={onChange}
    />

}
