"use client";

import React, { useState, useEffect } from "react";

import InlineCode from "@/components/InlineCode";
import MonospaceBlock from "@/components/MonospaceBlock";


export default function Instructions() {


    return (
        <div className="h-full p-4">

            <h2 className="font-bold text-3xl">
                Hello World
            </h2>

            <div className="font-bold text-sm mt-2 bg-green-500 inline-block pt-0.5 px-1.5 rounded text-zinc-800">
                {/* EZ */}
                EASY
            </div>
            <div className="font-bold text-sm mt-2 bg-yellow-500 inline-block pt-0.5 px-1.5 rounded text-zinc-800">
                {/* MID */}
                MEDIUM
            </div>
            <div className="font-bold text-sm mt-2 bg-red-500 inline-block pt-0.5 px-1.5 rounded text-zinc-800">
                HARD
            </div>
            <div className="font-bold text-sm mt-2 bg-purple-500 inline-block pt-0.5 px-1.5 rounded text-zinc-800">
                {/* PROBLEMATIC */}
                CHALLENGE
            </div>




            <div className="mt-6">
                Print the string <InlineCode>Hello, World!</InlineCode>.
            </div>


            <div className="mt-10">
                <h2 className="text-lg font-bold mb-2">Example 1:</h2>

                <MonospaceBlock>
                    <div>
                        <div className="font-bold">Input:</div>
                        <div className="text-zinc-400"><i>N/A</i></div>
                    </div>
                    <br/>
                    <div>
                        <div className="font-bold">Output:</div>
                        <div>Hello, World!</div>
                    </div>
                </MonospaceBlock>
            </div>

        </div>
    )
}

