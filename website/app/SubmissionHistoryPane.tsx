"use client";

import React, { useState } from "react";

import { Submission, useChallengeSubmissionHistory } from "@/submissions/submissions";


import Dropdown from "@/components/Dropdown";



interface SubmissionHistoryPaneProps {
    challengeId: string;
}


const SubmissionHistoryPane: React.FC<SubmissionHistoryPaneProps> = ({ challengeId }) => {

    const [sortMethod, setSortMethod] = useState<string>("date-desc");


    const { challengeSubmissions } = useChallengeSubmissionHistory(challengeId);
    // console.log(challengeSubmissions);


    // Get best time
    const fastestTime = Math.min(...challengeSubmissions.map(submission => submission.duration));
    // console.log(fastestTime);


    function getSortedSubmissions(): Submission[] {
        if (sortMethod === "date-desc") {
            return challengeSubmissions.sort((a, b) => a.timestamp - b.timestamp);
        } else if (sortMethod === "time-asc") {
            return challengeSubmissions.sort((a, b) => b.duration - a.duration);
        } else {
            // Handle unexpected sortMethod value
            throw new Error("Invalid sort method");
        }
    }
    const challengeSubmissionsSorted = getSortedSubmissions();

    // const challengeSubmissions = [1];
    // const challengeSubmissions = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];



    return (
        <div className="h-full p-4 flex flex-col">

            <div>
                <h2 className="text-xl font-bold mb-4 flex justify-between">
                    <div>
                        Submission History
                    </div>
                    <div>
                        {/* <span className="text-base">Sort: </span> */}
                        <Dropdown
                            options={[
                                {value:"date-desc", label:"Date (desc)"},
                                {value:"time-asc", label:"Time (asc)"},
                            ]}
                            // onChange={(value) => console.log("new value", value)}
                            onChange={setSortMethod}
                            defaultValue={sortMethod}
                        />
                    </div>
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
                        {challengeSubmissionsSorted.toReversed().map(submission => (
                            <tr className="h-1 border-b-[1px] border-b-zinc-800" key={submission.timestamp}>
                                {/* <div className="p-2 border-b-black border-b-2">
                                    hi
                                </div> */}
                                
                                {/* <td>
                                    {submission.success}
                                </td> */}
                                <td className={`p-1 font-mono ${(submission.duration == fastestTime) && "text-green-500 font-bold"}`}>
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


export default SubmissionHistoryPane;
