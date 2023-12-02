
/*

    Function that takes a code string and returns data in the resutls of the test.
    For now lets just return true or false on success/failure of challenge.


*/

import { ModuleThread } from 'threads';
import { PythonWorker } from "@/python/pythonWorker";



function checkOutputCorrect(expected: string[], actual: string[]): boolean {
    return JSON.stringify(expected) == JSON.stringify(actual);
}




export async function challengeHelloWorld(pythonWorker: ModuleThread<PythonWorker>, codeString: string) {

    await new Promise(resolve => setTimeout(() => resolve("some value"), 1000));


    const outputLines = await pythonWorker.runPythonAsync(codeString);
    console.log("Output Lines", outputLines);

    const isCorrect = checkOutputCorrect(["Hello, World!"], outputLines);
    console.log("correct", isCorrect);

    return isCorrect;
}

