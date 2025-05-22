import {createContext, ReactNode, useCallback, useContext, useMemo, useState} from 'react';
import {getInstructionPrompt, getNextUIStatePrompt} from "./agentPrompts.ts";
import {useSmartComponentManager} from "../SmartComponentManager";
import {AgentResponse} from "./openAI.ts";
import {ChatMessage, ChatMessageCreator} from "../../utils/types.ts";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";

interface SmartAgentProviderContextType {
    /**
     * Sends a prompt to the AI agent.
     * @param message The message to send.
     */
    sendPrompt: (prompt: string) => Promise<void>;
    /**
     * Accept or deny suggested changes of the AI agent.
     * @param accept Accepts the changes when true.
     */
    handleChangeApproval: (accept: boolean) => Promise<void>;
    /**
     * When true, an approval by the user is required.
     */
    approvalRequired: boolean;
    chatHistory: ChatMessage[];
}

const SmartAgentProviderContext = createContext<SmartAgentProviderContextType | undefined>(undefined);

export interface SmartAgentProviderProps {
    /**
     * Callback used to send prompts to the AI agent.
     * @param messages Messages sent to the AI agent.
     */
    callAgent: (messages: ChatCompletionMessageParam[]) => Promise<AgentResponse>;
    /**
     * Indicates how many messages the AI knows about. A higher number results in a higher number of tokens.
     * Must be greater than 0. Default value is 5.
     */
    chatHistoryMemory?: number;
    /**
     * Children nodes.
     */
    children: ReactNode;
}

export function SmartAgentProvider(props: SmartAgentProviderProps) {
    const {callAgent, chatHistoryMemory = 5, children} = props;

    const {getHierarchy, suggestValueChanges, handleChangeApproval} = useSmartComponentManager();

    const [approvalRequired, setApprovalRequired] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

    const sendPrompt = useCallback(async (prompt: string): Promise<void> => {
        const state = getHierarchy();
        const uiStatePrompt = getNextUIStatePrompt(state);

        if(chatHistoryMemory < 1) {
            console.error(`Configuration error: chatHistoryMemory has value of ${chatHistoryMemory} and must be greater than 0!`);
            return;
        }

        const messages: ChatCompletionMessageParam[] = chatHistory.slice(-chatHistoryMemory).map((chatMessage) => ( {
            role: chatMessage.creator,
            content: chatMessage.message,
        }));
        messages.push({
            role: ChatMessageCreator.SYSTEM,
            content: uiStatePrompt,
        })
        messages.push({
            role: ChatMessageCreator.USER,
            content: prompt,
        })
        messages.splice(0, 0, {role: ChatMessageCreator.SYSTEM, content: getInstructionPrompt()})

        setChatHistory((prev) => [...prev,
            {
                creator: ChatMessageCreator.SYSTEM,
                message: uiStatePrompt,
                sentTime: new Date()
            },
            {
                creator: ChatMessageCreator.USER,
                message: prompt,
                sentTime: new Date()
            },
            ]
        )

        const response: AgentResponse  = await callAgent(messages);
        /*const updates: ValueUpdate[]  = [
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
        ];*/
        console.log(response.uiInteractions);
        console.log(response.naturalLanguageInteraction);

        const changedDetected = await suggestValueChanges(response.uiInteractions);
        if(changedDetected) {
            setApprovalRequired(response.uiInteractions.length > 0 || approvalRequired);
        } else {
            setApprovalRequired(false);
        }
        setChatHistory((prev) => [...prev, {
            creator: ChatMessageCreator.AGENT,
            message: JSON.stringify(response),
            sentTime: new Date()}]
        )
    }, [getHierarchy, chatHistory, callAgent, suggestValueChanges, approvalRequired]);

    const changeApproval = useCallback(async (accept: boolean): Promise<void> => {
        await handleChangeApproval(accept);
        setApprovalRequired(false);
    }, [handleChangeApproval]);

    const value = useMemo(() => ({
        sendPrompt: sendPrompt,
        handleChangeApproval: changeApproval,
        approvalRequired: approvalRequired,
        chatHistory: chatHistory,
    }), [approvalRequired, changeApproval, sendPrompt, chatHistory]);


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
