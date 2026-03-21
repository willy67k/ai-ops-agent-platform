import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";
import type { Message } from "@ai-ops/types";
import { chatWithAgent, getConversationHistory, getConversationsList } from "../services/agentApi.js";
import Sidebar from "../components/Sidebar.js";
import ChatArea from "../components/ChatArea.js";
import ChatInput from "../components/ChatInput.js";

const ChatPage: React.FC = () => {
  const { messages, isLoading, conversationId, addMessage, setMessages, setConversations, setLoading, setStatus, setConversationId, clearMessages } = useChatStore();

  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 初始化取得歷史列表
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await getConversationsList();
        if (res.success) setConversations(res.data);
      } catch (err) {
        console.error("無法取得歷史列表", err);
      }
    };
    fetchList();
  }, [setConversations]);

  // 捲動至對話最底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 送出訊息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue };
    addMessage(userMessage);
    setInputValue("");
    setLoading(true);
    setStatus("正在準備回答...");

    try {
      setTimeout(() => setStatus("正在與 OpenAI 連線..."), 500);
      setTimeout(() => setStatus("AI 正在思考並呼叫工具..."), 1500);

      const response = await chatWithAgent(inputValue, messages, conversationId);

      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
        const listRes = await getConversationsList();
        if (listRes.success) setConversations(listRes.data);
      }

      if (!response.success) {
        throw new Error(response.message || "未知錯誤");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data || "抱歉，我暫時無法回答這個問題。",
      };
      addMessage(assistantMessage);
    } catch (error: any) {
      console.error("對話失敗", error);
      const errorMessage = error.response?.data?.message || error.message || "發生錯誤，請稍後再試。";
      addMessage({ role: "assistant", content: `系統錯誤：${errorMessage}` });
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  // 切換對話紀錄
  const handleSelectConversation = async (id: string) => {
    if (isLoading) return;
    setLoading(true);
    setStatus("正在載入歷史紀錄...");
    try {
      const res = await getConversationHistory(id);
      if (res.success) {
        setMessages(res.data);
        setConversationId(id);
      }
    } catch (err) {
      console.error("載入對話失敗", err);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const handleNewChat = () => {
    if (isLoading) return;
    clearMessages();
  };

  return (
    <div className="flex h-screen flex-col bg-[#0b0f19] font-sans text-gray-100 md:flex-row">
      <Sidebar onSelectConversation={handleSelectConversation} onNewChat={handleNewChat} />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        <ChatArea chatEndRef={chatEndRef} />
        <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSend} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default ChatPage;
