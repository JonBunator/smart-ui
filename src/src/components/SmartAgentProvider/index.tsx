import {createContext, useContext, ReactNode, useMemo, useCallback, useState} from 'react';
import {getNextUIStatePrompt} from "./agentPrompts.ts";
import {ValueUpdate} from "../../utils/types.ts";
import {useSmartComponentManager} from "../SmartComponentManager";

interface SmartAgentProviderContextType {
    /**
     * Sends a prompt to the AI agent.
     * @param message The message to send.
     */
    sendPrompt: (prompt: string) => void;
    /**
     * Accept or deny suggested changes of the AI agent.
     * @param accept Accepts the changes when true.
     */
    handleChangeApproval: (accept: boolean) => void;
    /**
     * When true, an approval by the user is required.
     */
    approvalRequired: boolean;
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

    const {getHierarchy, suggestValueChanges, handleChangeApproval} = useSmartComponentManager();

    const [approvalRequired, setApprovalRequired] = useState(false);

    const sendPrompt = useCallback(async (prompt: string): Promise<void> => {
        const state = getHierarchy();
        const systemPrompt = getNextUIStatePrompt(state);
        console.log(systemPrompt, prompt)

        //const updates: ValueUpdate[]  = await callAgent(systemPrompt, prompt);
        const updates: ValueUpdate[]  = [
            {
                "id": "name",
                "value": "Jonas"
            },
            {
                "id": "age",
                "value": 24
            },
            {
                "id": "gender-male",
                "value": true
            },
            {
                "id": "interests-sports",
                "value": true
            },
            {
                "id": "interests-other",
                "value": "Rubik's Cubes"
            },
            {
                "id": "favourite-animal",
                "value": "Bird"
            },
            {
                "id": "smart-button",
                "value": ""
            },
        ];
        console.log(updates);
        setApprovalRequired(true);
        await suggestValueChanges(updates);
    }, [callAgent, suggestValueChanges, getHierarchy]);

    const changeApproval = useCallback((accept: boolean): void => {
        handleChangeApproval(accept);
        setApprovalRequired(false);
    }, [handleChangeApproval]);

    const value = useMemo(() => ({
        sendPrompt: sendPrompt,
        handleChangeApproval: changeApproval,
        approvalRequired: approvalRequired,
    }), [approvalRequired, changeApproval, sendPrompt]);


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