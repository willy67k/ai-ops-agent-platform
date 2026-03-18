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
  isLoading: boolean;
  status: string;
  addMessage: (message: Message) => void;
  setLoading: (isLoading: boolean) => void;
  setStatus: (status: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  status: "",
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setStatus: (status) => set({ status }),
  clearMessages: () => set({ messages: [] }),
}));
