
import React from "react";

import Speedrun from "./Speedrun";


export default function Home() {
  return (
    <main className="p-4 w-full h-[100vh]">
      <div className="h-full flex flex-col">

        <h1 className="font-bold mb-2">
          Programming Speedrun Website thingo
        </h1>

        {/* This is so stupid: https://stackoverflow.com/questions/34144972/flexbox-avoid-child-with-longer-height-than-parent-column-direction */}
        <div className="min-h-0 flex-1">
          <Speedrun/>
        </div>

      </div>
    </main>
  )
}
