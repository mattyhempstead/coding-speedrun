"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';


export type Submission = {
    success: boolean; // not needed really
    duration: number;  // null if did not finish
    timestamp: number;  // unix timestamp in millis that game finished (not started)
    charCount: number;  // number of characters in solution
};


type SubmissionHistory = {
    submissionHistory: { [challengeId: string]: Submission[] };
    addSubmission: (challengeId: string, submission: Submission) => void;
};

const SubmissionHistoryContext = createContext<SubmissionHistory | undefined>(undefined);

type SubmissionHistoryProviderProps = {
    children: ReactNode;
};

export const SubmissionHistoryProvider: React.FC<SubmissionHistoryProviderProps> = ({ children }) => {
    const [submissionHistory, setSubmissionHistory] = useState<{ [challengeId: string]: Submission[] }>({});
    
    const addSubmission = (challengeId: string, submission: Submission) => {
        setSubmissionHistory(prev => ({
            ...prev,
            [challengeId]: [...(prev[challengeId] || []), submission],
        }));
    };
    
    return (
        <SubmissionHistoryContext.Provider value={{ submissionHistory, addSubmission }}>
        {children}
        </SubmissionHistoryContext.Provider>
    );
};
    
    
export const useSubmissionHistory = () => {
    const context = useContext(SubmissionHistoryContext);
    if (!context) {
        throw new Error('useSubmissionHistory must be used within a SubmissionHistoryProvider');
    }
    return context;
};



export const useChallengeSubmissionHistory = (challengeId: string) => {
    const { submissionHistory, addSubmission } = useSubmissionHistory();
    
    const challengeSubmissions = submissionHistory[challengeId] || [];
    
    const addChallengeSubmission = (submission: Submission) => {
        addSubmission(challengeId, submission);
    };
    
    return {challengeSubmissions, addChallengeSubmission};
};
