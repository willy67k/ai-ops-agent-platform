import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "./store/useChatStore.js";
import type { Message } from "./store/useChatStore.js";
import { chatWithAgent, getConversationHistory, getConversationsList } from "./services/agentApi.js";
import "./index.css";

const App: React.FC = () => {
  const { 
    messages, 
    conversations, 
    isLoading, 
    status, 
    conversationId, 
    addMessage, 
    setMessages, 
    setConversations, 
    setLoading, 
    setStatus, 
    setConversationId,
    clearMessages 
  } = useChatStore();
  
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
      // 這裡可以根據階段 4 的要求，模擬多種狀態變化感
      setTimeout(() => setStatus("正在與 OpenAI 連線..."), 500);
      setTimeout(() => setStatus("AI 正在思考並呼叫工具..."), 1500);

      const response = await chatWithAgent(inputValue, messages, conversationId);

      // 更新會話 ID (如果是新對話)
      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
        // 重新整理列表
        const listRes = await getConversationsList();
        if (listRes.success) setConversations(listRes.data);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.message || "抱歉，我暫時無法回答這個問題。",
      };
      addMessage(assistantMessage);
    } catch (error) {
      console.error("對話失敗", error);
      addMessage({ role: "assistant", content: "發生錯誤，請稍後再試。" });
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

  // 開啟新對話
  const handleNewChat = () => {
    if (isLoading) return;
    clearMessages();
  };

  return (
    <div className="flex h-screen flex-col bg-[#0b0f19] font-sans text-gray-100 md:flex-row">
      {/* 側邊狀態面板 Status Panel */}
      <aside className="w-full flex flex-col border-b border-gray-800 bg-[#0f172a] p-6 md:w-80 md:border-r md:border-b-0">
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">AI Ops Platform</h1>
          <p className="text-sm text-gray-400">智能運維助手</p>
        </div>

        <button 
          onClick={handleNewChat}
          className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 py-3 text-sm font-semibold transition-all hover:bg-gray-700 active:scale-95"
        >
          <span>＋</span> 開啟新對話
        </button>

        <div className="flex flex-1 flex-col overflow-hidden">
          <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">歷史紀錄</h2>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full text-left rounded-lg p-3 text-sm transition-all hover:bg-white/5 ${conversationId === conv.id ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400' : 'text-gray-400'}`}
              >
                <div className="truncate font-medium">{conv.title || "未命名對話"}</div>
                <div className="mt-1 text-[10px] opacity-40">{new Date(conv.createdAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">系統狀態</h2>
          <div className="flex items-center gap-3 space-x-2 rounded-xl border border-gray-800 bg-gray-900/50 p-4 backdrop-blur-sm">
            <div className={`h-2 w-2 rounded-full ${isLoading ? "animate-pulse bg-green-500" : "bg-gray-600"}`}></div>
            <span className="text-xs font-medium">{isLoading ? status : "等待指令中..."}</span>
          </div>
        </div>
      </aside>

      {/* 聊天視窗 Chat Window */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div className="scrollbar-thin scrollbar-thumb-gray-800 flex-1 space-y-6 overflow-y-auto p-4 md:p-8">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">🤖</div>
              <p className="text-lg">我是您的 AI Ops 助手，告訴我您想查詢什麼 Jira 任務？</p>
              <p className="text-sm">例如：「幫我查還有哪些任務是 To Do 狀態？」</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${msg.role === "user" ? "rounded-tr-none bg-blue-600 text-white" : "rounded-tl-none border border-gray-700 bg-[#1e293b]"}`}>
                <div className="mb-1 text-xs font-medium opacity-50">{msg.role === "user" ? "You" : "Ops Agent"}</div>
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* 輸入區域 Input Area */}
        <div className="border-t border-gray-800 bg-[#0f172a]/80 p-6 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl gap-4">
            <input
              type="text"
              className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 transition-all placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="輸入訊息範例：幫我查詢所有待辦中的 Jira 任務..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <button
              className={`rounded-xl px-6 py-3 font-semibold shadow-lg shadow-blue-900/20 transition-all ${isLoading ? "cursor-not-allowed bg-gray-700 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"}`}
              onClick={handleSend}
              disabled={isLoading}
            >
              送出
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
