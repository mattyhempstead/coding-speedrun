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
    keyboardMode: string;
}


export default function CodeEditor({ enabled, onChange, keyboardMode }: CodeEditorProps) {

    // Reference to code editor
    // Needed so we can .focus() and .blur() it
    const editorRef = useRef<AceEditor>(null);


    const enableAndFocusEditor = () => {
        /* Enable the editor, make cursor visible, and then focus */
        // console.log("Focusing editor.");
        if (!editorRef.current) throw new Error("No editor ref??");

        const editor = editorRef.current.editor;
        editor.setReadOnly(false);
        editor.setHighlightActiveLine(true);
        editor.setHighlightGutterLine(true);
        (editor.renderer as any).$cursorLayer.element.style.opacity=1;
        editor.focus();

        // Clear editor and reset history
        editor.session.setValue("");
    };

    const disableAndBlurEditor = () => {
        /* Disable the editor, make cursor invisible, and then un-focus/blur */
        // console.log("Disabling editor.");
        if (!editorRef.current) throw new Error("No editor ref??");

        const editor = editorRef.current.editor;
        editor.setReadOnly(true);
        editor.setHighlightActiveLine(false);
        editor.setHighlightGutterLine(false);
        (editor.renderer as any).$cursorLayer.element.style.opacity=0;
        editor.blur();
    };


    // UseEffect hook to watch the enabled prop
    useEffect(() => {
        if (enabled) {
            enableAndFocusEditor();
        } else {
            disableAndBlurEditor();
        }
    }, [enabled])


    // Hook that will run once to remove the command that overlaps with Ctrl+Enter code submit
    useEffect(() => {
        if (editorRef.current) {
            const editor = editorRef.current.editor;

            // Remove command that overlaps with Ctrl+Enter
            // This only seems to apply to vscode mode thankfully
            editor.commands.removeCommand("addLineAfter");

            // TODO: Fix bug where vim mode is not reset between games
            // editor.commands.on("afterExec", function(e) {
            //     console.log(e);
            // });

        }
    }, [editorRef]);


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

        // keyboardHandler="vim"
        keyboardHandler={keyboardMode}

        // https://codepen.io/zymawy/pen/XwbxoJ
        setOptions={{
            showLineNumbers: true,
            enableBasicAutocompletion: true,
        }}

        onChange={onChange}
    />

}
