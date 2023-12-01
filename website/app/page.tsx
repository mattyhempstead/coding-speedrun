
import React from "react";

import Speedrun from "./Speedrun";


export default function Home() {
  return (
    <main className="p-4 w-full h-[100vh]">
      <div className="h-full flex flex-col">

        <h1 className="font-bold">
          Programming Speedrun Website thing
        </h1>


        <div className="flex-auto">
          <Speedrun/>
        </div>


      </div>
    </main>
  )
}
