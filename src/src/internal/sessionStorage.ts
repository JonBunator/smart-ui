import {ChatMessage} from "../utils/types.ts";

const CHAT_HISTORY_KEY = 'smartAgentChatHistory';

export function saveChatHistoryToSessionStorage(chatHistory: ChatMessage[]) {
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
}

export function loadChatHistoryFromSessionStorage(): ChatMessage[] {
    const storedChatHistory = sessionStorage.getItem(CHAT_HISTORY_KEY);
    if (storedChatHistory) {
        return JSON.parse(storedChatHistory);
    }
    return [];
}