import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {getInstructionPrompt, getNextUIStatePrompt, getPageDescriptions} from "./agentPrompts.ts";
import {SmartComponentElement, useSmartComponentManager} from "../SmartComponentManager";
import {AgentInput, AgentOutput, ChatMessage, ChatMessageCreator, PageDescription} from "../../utils/types.ts";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";
import {loadChatHistoryFromSessionStorage, saveChatHistoryToSessionStorage} from "../../internal/sessionStorage.ts";
import {AgentResponse} from "../../utils/types";
import {
    findPageTransitionPath,
    flattenUIState,
    getPageTransitionPath,
    getUIElementIDs,
    getUIInteractionExamples
} from "./helpers.ts";

interface SmartAgentProviderContextType {
    /**
     * Sends an user prompt to the AI agent.
     * @param prompt The message to send.
     * @param chatHistoryMemory Indicates how many messages the AI knows about. A higher number results in a higher
     * number of tokens. Must be greater than 0. When undefined, the default value is used.
     * @param loadingText Text that should be used while the response is loading.
     */
    sendPrompt: (prompt: string, chatHistoryMemory?: number, loadingText?: string) => Promise<void>;
    /**
     * Sends an event to the AI agent.
     * @param prompt The message to send.
     * @param chatHistoryMemory Indicates how many messages the AI knows about. A higher number results in a higher
     * number of tokens. Must be greater than 0. When undefined, the default value is used.
     * @param loadingText Text that should be used while the response is loading.
     */
    sendEvent: (prompt: string, chatHistoryMemory?: number, loadingText?: string) => Promise<void>;
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
    /**
     * Loading text that indicates why response is loading.
     */
    loadingText: string | undefined;
}

const SmartAgentProviderContext = createContext<SmartAgentProviderContextType | undefined>(undefined);

export interface SmartAgentProviderProps {
    /**
     * Callback used to send prompts to the AI agent.
     * @param agentInput Input to the AI agent.
     */
    callAgent: (agentInput: AgentInput) => Promise<AgentResponse>;
    /**
     * Indicates how many messages the AI knows about. A higher number results in a higher number of tokens.
     * Must be greater than 0. Default value is 5.
     */
    defaultChatHistoryMemory?: number;
    /**
     * Change the default system instructions.
     */
    customSystemPrompt?: string
    /**
     * The path of the current page. This is used to tell the agent on which page the user is currently on.
     */
    currentPagePath?: string
    /**
     * Describes for what the pages are used for.
     */
    pageDescriptions?: PageDescription[]
    /**
     * When true the agent can suggest changes in multiple steps. Defaults to true.
     */
    allowMultipleSteps?: boolean
    /**
     * Children nodes.
     */
    children: ReactNode;
}

export function SmartAgentProvider(props: SmartAgentProviderProps) {
    const {
        callAgent,
        defaultChatHistoryMemory = 5,
        customSystemPrompt,
        currentPagePath,
        pageDescriptions,
        allowMultipleSteps = true,
        children
    } = props;

    const {
        getHierarchy,
        suggestValueChanges,
        handleChangeApproval,
        subscribeAllComponentsLoaded
    } = useSmartComponentManager();
    const [approvalRequired, setApprovalRequired] = useState(false);
    const nextMessages = useRef<AgentOutput[] | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState<string | undefined>(undefined);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

    const lastMessageUIStateFlat = useRef<SmartComponentElement[]>([]);
    const numSteps = useRef<number | undefined>(undefined);

    useEffect(() => {
        setChatHistory(loadChatHistoryFromSessionStorage());
    }, []);

    useEffect(() => {
        saveChatHistoryToSessionStorage(chatHistory);
    }, [chatHistory]);

    const sendMessage = useCallback(async (prompt: string, messageRole: ChatMessageCreator, chatHistoryMemory?: number, loadingText?: string): Promise<void> => {
        if (defaultChatHistoryMemory < 1) {
            console.error(`Configuration error: defaultChatHistoryMemory has value of ${defaultChatHistoryMemory} and must be greater than 0!`);
            return;
        } else if (chatHistoryMemory && chatHistoryMemory < 1) {
            console.error(`Configuration error: chatHistoryMemory has value of ${chatHistoryMemory} and must be greater than 0!`);
            return;
        }
        setLoading(true);
        setLoadingText(loadingText);
        const state = getHierarchy();
        lastMessageUIStateFlat.current = flattenUIState(state);
        const uiInteractionExamples = getUIInteractionExamples(lastMessageUIStateFlat.current);
        const uiElementIds = getUIElementIDs(lastMessageUIStateFlat.current);
        const uiStatePrompt = getNextUIStatePrompt(state, uiInteractionExamples, currentPagePath);
        const memory = chatHistoryMemory ?? defaultChatHistoryMemory;
        const systemPrompt = customSystemPrompt ?? getInstructionPrompt();
        const systemInstructions = `${systemPrompt}${getPageDescriptions(pageDescriptions)}`

        let messages: ChatCompletionMessageParam[] = chatHistory.slice(-memory).map(message => message.message);
        messages.push({
            role: ChatMessageCreator.SYSTEM,
            content: uiStatePrompt,
        })
        messages.push({
            role: messageRole,
            content: prompt,
        })

        // Remove tool messages when tool invocation is missing
        if (messages[0].role === 'tool') {
            const firstNonToolIndex = messages.findIndex(item => item.role !== 'tool');
            messages = firstNonToolIndex === -1 ? [] : messages.slice(firstNonToolIndex);
        }

        messages.splice(0, 0, {role: ChatMessageCreator.SYSTEM, content: systemInstructions})
        setChatHistory((prev) => [...prev,
                {
                    message: {role: ChatMessageCreator.SYSTEM, content: uiStatePrompt},
                    sentTime: (new Date()).toUTCString()
                },
                {
                    message: {role: messageRole, content: prompt},
                    sentTime: (new Date()).toUTCString()
                },
            ]
        )

        const response: AgentResponse = await callAgent({
            messages: messages,
            uiElementIds: uiElementIds,
            allowMultipleSteps: allowMultipleSteps
        });
        const agentOutput = response.agentOutput;
        const firstOutput = agentOutput[0];
        numSteps.current = agentOutput.length;
        if (agentOutput.length > 1) {
            nextMessages.current = agentOutput.slice(1);
        }
        const newMessages = response.messages.slice(messages.length);

        if (newMessages !== undefined) {
            const toolMessages = newMessages.map(message => ({message: message, sentTime: (new Date()).toUTCString()}));
            setChatHistory((prev) => [...prev, ...toolMessages]);
        }
        const uiInteractions = firstOutput.uiInteractions;
        const changedDetected = await suggestValueChanges(uiInteractions);
        if (changedDetected) {
            setApprovalRequired(uiInteractions.length > 0 || approvalRequired);
        } else {
            setApprovalRequired(false);
        }
        addNextChatMessage(firstOutput, agentOutput.length > 1 ? 1 : undefined);
        setLoading(false);
        setLoadingText(undefined);
    }, [defaultChatHistoryMemory, getHierarchy, currentPagePath, customSystemPrompt, pageDescriptions, chatHistory, callAgent, allowMultipleSteps, suggestValueChanges, approvalRequired]);


    function addNextChatMessage(agentOutput: AgentOutput, step: number | undefined) {
        const output = {
            output: agentOutput,
            path: getPageTransitionPath(agentOutput.uiInteractions, lastMessageUIStateFlat.current),
            step: step,
            numSteps: numSteps.current === undefined || numSteps.current > 1 ? numSteps.current : undefined,
        };

        setChatHistory((prev) => [...prev, {
                message: {role: ChatMessageCreator.AGENT, content: JSON.stringify(output)},
                sentTime: (new Date()).toUTCString()
            }]
        )
    }

    const sendPrompt = useCallback(async (prompt: string, chatHistoryMemory?: number, loadingText?: string): Promise<void> => {
        await sendMessage(prompt, ChatMessageCreator.USER, chatHistoryMemory, loadingText);
    }, [sendMessage]);

    const sendEvent = useCallback(async (prompt: string, chatHistoryMemory?: number, loadingText?: string): Promise<void> => {
        await sendMessage(`This event was triggered by the system: ${prompt}`, ChatMessageCreator.SYSTEM, chatHistoryMemory, loadingText);
    }, [sendMessage]);

    const changeApproval = useCallback(async (accept: boolean): Promise<void> => {
        await handleChangeApproval(accept);
        if (accept && nextMessages.current !== undefined) {
            await suggestValueChanges(nextMessages.current[0].uiInteractions);
            if (nextMessages.current.length > 0 && numSteps.current !== undefined) {
                addNextChatMessage(nextMessages.current[0], numSteps.current - nextMessages.current.length + 1);
            }
            nextMessages.current = nextMessages.current?.length === 1 ? undefined : nextMessages.current?.slice(1);

        } else {
            setApprovalRequired(false);
            nextMessages.current = undefined;
        }
    }, [handleChangeApproval, suggestValueChanges]);

    const deleteChatHistory = useCallback(() => {
        setChatHistory([]);
    }, []);

    useEffect(() => {
        // Is used to send a page change event to the agent when the page is loaded
        const unsubscribe = subscribeAllComponentsLoaded(async () => {
            const navigationPath = findPageTransitionPath(loadChatHistoryFromSessionStorage());
            if (navigationPath !== null && currentPagePath === navigationPath) {
                await sendEvent(`Page changed to ${currentPagePath}`);
                unsubscribe();
            }
        })
        return () => unsubscribe();
    }, [changeApproval, currentPagePath, getHierarchy, sendEvent, subscribeAllComponentsLoaded]);

    useEffect(() => {
        setApprovalRequired(false);
        setLoading(false);
        setLoadingText(undefined);
        nextMessages.current = undefined;
        lastMessageUIStateFlat.current = [];
        numSteps.current = undefined;
    }, [currentPagePath]);

    const value = useMemo(() => ({
        sendPrompt: sendPrompt,
        sendEvent: sendEvent,
        handleChangeApproval: changeApproval,
        deleteChatHistory: deleteChatHistory,
        approvalRequired: approvalRequired,
        chatHistory: chatHistory,
        loading,
        loadingText,
    }), [sendPrompt, sendEvent, changeApproval, deleteChatHistory, approvalRequired, chatHistory, loading, loadingText]);


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
