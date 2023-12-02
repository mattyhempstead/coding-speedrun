
import React from "react";

import Speedrun from "./Speedrun";


export default function Home() {
  return (
    <main className="p-4 w-full h-[100vh]">
      <div className="h-full flex flex-col">

        <h1 className="font-bold mb-2">
          Programming Speedrun Website thingo
        </h1>


        <div className="flex-auto">
          <Speedrun/>
        </div>


      </div>
    </main>
  )
}
