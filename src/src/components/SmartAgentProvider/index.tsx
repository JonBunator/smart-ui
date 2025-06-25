import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {getInstructionPrompt, getNextUIStatePrompt} from "./agentPrompts.ts";
import {useSmartComponentManager} from "../SmartComponentManager";
import {ChatMessage, ChatMessageCreator} from "../../utils/types.ts";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";
import {loadChatHistoryFromSessionStorage, saveChatHistoryToSessionStorage} from "../../internal/sessionStorage.ts";
import {AgentResponse} from "../../utils/types";

interface SmartAgentProviderContextType {
    /**
     * Sends a prompt to the AI agent.
     * @param prompt The message to send.
     * @param chatHistoryMemory Indicates how many messages the AI knows about. A higher number results in a higher
     * number of tokens. Must be greater than 0. When undefined, the default value is used.
     */
    sendPrompt: (prompt: string, chatHistoryMemory?: number) => Promise<void>;
    /**
     * Accept or deny suggested changes of the AI agent.
     * @param accept Accepts the changes when true.
     */
    handleChangeApproval: (accept: boolean) => Promise<void>;
    /**
     * Deletes the chat history with the agent.
     */
    deleteChatHistory: () => void;
    /**
     * When true, an approval by the user is required.
     */
    approvalRequired: boolean;
    /**
     * Chat history between user and agent.
     */
    chatHistory: ChatMessage[];
    /**
     * Loading is true when user waits for agent response.
     */
    loading: boolean;
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
    defaultChatHistoryMemory?: number;
    /**
     * Children nodes.
     */
    children: ReactNode;
}

export function SmartAgentProvider(props: SmartAgentProviderProps) {
    const {callAgent, defaultChatHistoryMemory = 5, children} = props;

    const {getHierarchy, suggestValueChanges, handleChangeApproval} = useSmartComponentManager();

    const [approvalRequired, setApprovalRequired] = useState(false);
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

    useEffect(() => {
        setChatHistory(loadChatHistoryFromSessionStorage());
    }, []);

    useEffect(() => {
        saveChatHistoryToSessionStorage(chatHistory);
    }, [chatHistory]);


    const sendPrompt = useCallback(async (prompt: string, chatHistoryMemory?: number): Promise<void> => {
        setLoading(true);
        const state = getHierarchy();
        const uiStatePrompt = getNextUIStatePrompt(state);

        if(defaultChatHistoryMemory < 1) {
            console.error(`Configuration error: defaultChatHistoryMemory has value of ${defaultChatHistoryMemory} and must be greater than 0!`);
            return;
        } else if(chatHistoryMemory && chatHistoryMemory < 1) {
            console.error(`Configuration error: chatHistoryMemory has value of ${chatHistoryMemory} and must be greater than 0!`);
            return;
        }

        const memory = chatHistoryMemory ?? defaultChatHistoryMemory;

        const messages: ChatCompletionMessageParam[] = chatHistory.slice(-memory).map((chatMessage) => ( {
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
                sentTime: (new Date()).toUTCString()
            },
            {
                creator: ChatMessageCreator.USER,
                message: prompt,
                sentTime: (new Date()).toUTCString()
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
            sentTime: (new Date()).toUTCString()}]
        )
        setLoading(false);
    }, [getHierarchy, defaultChatHistoryMemory, chatHistory, callAgent, suggestValueChanges, approvalRequired]);

    const changeApproval = useCallback(async (accept: boolean): Promise<void> => {
        await handleChangeApproval(accept);
        setApprovalRequired(false);
    }, [handleChangeApproval]);

    const deleteChatHistory = useCallback(() => {
        setChatHistory([]);
    }, []);

    const value = useMemo(() => ({
        sendPrompt: sendPrompt,
        handleChangeApproval: changeApproval,
        deleteChatHistory: deleteChatHistory,
        approvalRequired: approvalRequired,
        chatHistory: chatHistory,
        loading,
    }), [sendPrompt, changeApproval, deleteChatHistory, approvalRequired, chatHistory, loading]);


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
