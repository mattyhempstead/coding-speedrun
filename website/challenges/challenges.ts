
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
    const { status, outputLines, error } = await pythonWorker.runPythonAsync(codeString);
    console.log("Output Lines", outputLines);

    if (status == "error") {
        // console.log("error", error);
        return false;
    }

    const isCorrect = checkOutputCorrect(["Hello, World!"], outputLines);
    console.log("correct", isCorrect);

    return isCorrect;
}




/** A map of all the test case functions for each challenge */
export const CHALLENGE_TESTS = {
    "hello-world": [
        {
            "name": "Hello, World!",
            "function": challengeHelloWorld,
        },
        {
            "name": "test case 2",
            "function": challengeHelloWorld,
        },
        // {
        //     "name": "test case 3",
        //     "function": challengeHelloWorld,
        // },
        // {
        //     "name": "test case 4",
        //     "function": challengeHelloWorld,
        // },
        // {
        //     "name": "test case 5 ",
        //     "function": challengeHelloWorld,
        // },
        // {
        //     "name": "test case 6",
        //     "function": challengeHelloWorld,
        // },
        // {
        //     "name": "test case 7",
        //     "function": challengeHelloWorld,
        // },
    ]
};

