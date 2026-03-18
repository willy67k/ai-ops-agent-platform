import { create } from "zustand";

/**
 * 對話訊息型別
 */
export interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * 聊天介面的狀態管理
 */
interface ChatState {
  messages: Message[];
  conversations: any[];
  isLoading: boolean;
  status: string;
  conversationId: string | null;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setConversations: (conversations: any[]) => void;
  setLoading: (isLoading: boolean) => void;
  setStatus: (status: string) => void;
  setConversationId: (id: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  conversations: [],
  isLoading: false,
  status: "",
  conversationId: null,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setConversations: (conversations) => set({ conversations }),
  setLoading: (isLoading) => set({ isLoading }),
  setStatus: (status) => set({ status }),
  setConversationId: (id) => set({ conversationId: id }),
  clearMessages: () => set({ messages: [], conversationId: null }),
}));
