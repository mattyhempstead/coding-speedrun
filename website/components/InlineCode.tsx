import React from 'react';

interface InlineCodeProps {
    children: React.ReactNode;
}

const InlineCode: React.FC<InlineCodeProps> = ({ children }) => {
    return (
        <code className="bg-zinc-700 p-0.5 rounded border-[0.1rem] border-zinc-500 text-zinc-300 mx-[0.1rem]">
            {children}
        </code>
    );
};

export default InlineCode;
