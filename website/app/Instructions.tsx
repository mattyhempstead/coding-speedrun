"use client";

import React, { useState, useEffect } from "react";

import InlineCode from "@/components/InlineCode";


export default function Instructions() {


    return (
        <div className="h-full p-4">

            <h2 className="font-bold text-2xl">
                Hello World
            </h2>

            <div>
                EASY 
            </div>

            <div className="mt-4">

                Print the string <InlineCode>Hello, World!</InlineCode>.



            </div>


        </div>
    )
}



