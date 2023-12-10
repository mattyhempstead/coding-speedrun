import React from 'react';

interface MonospaceBlockProps {
    children: React.ReactNode;
}

const MonospaceBlock: React.FC<MonospaceBlockProps> = ({ children }) => {
    return (
        <div className="bg-zinc-700 p-2 rounded border-[0.1rem] border-zinc-500 text-zinc-300 font-mono">
            {children}
        </div>
    );
};

export default MonospaceBlock;
