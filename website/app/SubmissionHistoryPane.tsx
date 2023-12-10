"use client";

import { useChallengeSubmissionHistory } from "@/submissions/submissions";


export default function SubmissionHistoryPane() {

    const { challengeSubmissions } = useChallengeSubmissionHistory("hello-world");
    console.log(challengeSubmissions);

    // const challengeSubmissions = [1];
    // const challengeSubmissions = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];


    // Get best time
    const fastestTime = Math.min(...challengeSubmissions.map(submission => submission.duration));
    console.log(fastestTime);


    return (
        <div className="h-full p-4 flex flex-col">

            <div>
                <h2 className="text-xl font-bold mb-4">
                    Submission History
                </h2>
            </div>

            <div className="flex-grow bg-zinc-900 rounded-lg min-h-0 overflow-y-auto">
                <table className="w-full table-auto relative">
                    <thead className=" bg-zinc-950 sticky top-0">
                        <tr className="">
                            {/* <th>Status</th> */}
                            <th className="p-0">
                                <div className="p-1 border-b-2 border-zinc-800">
                                    Time (s)
                                </div>
                            </th>
                            <th className="p-0">
                                <div className="p-1 border-b-2 border-zinc-800">
                                    Characters
                                </div>
                            </th>
                            <th className="p-0">
                                <div className="p-1 border-b-2 border-zinc-800">
                                    Date
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="text-center">
                        {challengeSubmissions.toReversed().map(submission => (
                            <tr className="h-1 border-b-[1px] border-b-zinc-800">
                                {/* <div className="p-2 border-b-black border-b-2">
                                    hi
                                </div> */}
                                
                                {/* <td>
                                    {submission.success}
                                </td> */}
                                <td className={`p-1 ${(submission.duration == fastestTime) && "text-green-500 font-bold"}`}>
                                    {(submission.duration/1000).toFixed(3)}
                                </td>
                                <td className="p-1">
                                    {submission.charCount}
                                </td>
                                <td className="p-1">
                                    {new Date(submission.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}


