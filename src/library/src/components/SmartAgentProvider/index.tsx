import {createContext, useContext, ReactNode, useMemo, useCallback} from 'react';
import OpenAI from "openai";
import {useSmartComponentManager} from "../../internal/SmartComponentManager";
import {getNextUIStatePrompt} from "./agentPrompts.ts";
import {callAgent} from "./openAI.ts";
import {ValueUpdate} from "../types/types.ts";

interface SmartAgentProviderContextType {
    /**
     * Sends a prompt to the AI agent.
     * @param message The message to send.
     */
    sendPrompt: (prompt: string) => void;
}

const SmartAgentProviderContext = createContext<SmartAgentProviderContextType | undefined>(undefined);

export interface SmartAgentProviderProps {
    /**
     * OpenAI API client used for the AI Agent.
     */
    openAIClient: OpenAI;
    /**
     * Children nodes.
     */
    children: ReactNode;
}

export function SmartAgentProvider(props: SmartAgentProviderProps) {
    const {openAIClient, children} = props;

    const {getHierarchy, changeMultipleValues} = useSmartComponentManager();
    
    const sendPrompt = useCallback(async (prompt: string): Promise<void> => {
        const state = getHierarchy();
        const systemPrompt = getNextUIStatePrompt(state);
        const updates: ValueUpdate[]  = await callAgent(openAIClient, systemPrompt, prompt);
        console.log(updates);
        await changeMultipleValues(updates);
    }, [changeMultipleValues, getHierarchy, openAIClient]);

    const value = useMemo(() => ({
        sendPrompt: sendPrompt
    }), [sendPrompt]);


    return (
        <SmartAgentProviderContext.Provider value={value}>
            {children}
        </SmartAgentProviderContext.Provider>
    );
}

export function useSmartAgent(): SmartAgentProviderContextType {
    const context = useContext(SmartAgentProviderContext);
    if (!context) {
        throw new Error('useSmartAgent must be used within a SmartAgentProviderContext');
    }
    return context;
}