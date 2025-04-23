import {createContext, useContext, ReactNode, useMemo, useCallback} from 'react';
import {getNextUIStatePrompt} from "./agentPrompts.ts";
import {ValueUpdate} from "../../utils/types.ts";
import {useSmartComponentManager} from "../SmartComponentManager";

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
     * Callback used to send prompts to the AI agent.
     * @param systemPrompt The system prompt of the agent. Used for system instructions.
     * @param prompt The user specified prompt.
     */
    callAgent: (systemPrompt: string, prompt: string) => Promise<ValueUpdate[]>;
    /**
     * Children nodes.
     */
    children: ReactNode;
}

export function SmartAgentProvider(props: SmartAgentProviderProps) {
    const {callAgent, children} = props;

    const {getHierarchy, changeMultipleValues} = useSmartComponentManager();
    
    const sendPrompt = useCallback(async (prompt: string): Promise<void> => {
        const state = getHierarchy();
        const systemPrompt = getNextUIStatePrompt(state);
        const updates: ValueUpdate[]  = await callAgent(systemPrompt, prompt);
        console.log(updates);
        await changeMultipleValues(updates);
    }, [callAgent, changeMultipleValues, getHierarchy]);

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