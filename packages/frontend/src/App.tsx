import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "./store/useChatStore.js";
import type { Message } from "./store/useChatStore.js";
import { chatWithAgent } from "./services/agentApi.js";
import "./index.css";

const App: React.FC = () => {
  const { messages, isLoading, status, addMessage, setLoading, setStatus } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

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

      const response = await chatWithAgent(inputValue, messages);
      
      const assistantMessage: Message = { 
        role: "assistant", 
        content: response.message || "抱歉，我暫時無法回答這個問題。" 
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

  return (
    <div className="flex h-screen flex-col bg-[#0b0f19] text-gray-100 font-sans md:flex-row">
      {/* 側邊狀態面板 Status Panel */}
      <aside className="w-full border-b border-gray-800 bg-[#0f172a] p-6 md:w-80 md:border-b-0 md:border-r">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            AI Ops Platform
          </h1>
          <p className="text-sm text-gray-400">智能運維助手</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">當前狀態</h2>
          <div className="flex items-center gap-3 space-x-2 rounded-xl bg-gray-900/50 p-4 border border-gray-800 backdrop-blur-sm">
            <div className={`h-3 w-3 rounded-full ${isLoading ? "bg-green-500 animate-pulse" : "bg-gray-600"}`}></div>
            <span className="text-sm font-medium">
              {isLoading ? status : "等待指令中..."}
            </span>
          </div>
          
          <div className="mt-8 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">可用工具</h2>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Jira 任務查詢系統</li>
              <li>• Slack/Email 通知發送</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* 聊天視窗 Chat Window */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
              <div className="mb-4 h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                🤖
              </div>
              <p className="text-lg">我是您的 AI Ops 助手，告訴我您想查詢什麼 Jira 任務？</p>
              <p className="text-sm">例如：「幫我查還有哪些任務是 To Do 狀態？」</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-[#1e293b] border border-gray-700 rounded-tl-none"
                }`}
              >
                <div className="mb-1 text-xs font-medium opacity-50">
                  {msg.role === "user" ? "You" : "Ops Agent"}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* 輸入區域 Input Area */}
        <div className="bg-[#0f172a]/80 p-6 backdrop-blur-md border-t border-gray-800">
          <div className="mx-auto flex max-w-4xl gap-4">
            <input
              type="text"
              className="flex-1 rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
              placeholder="輸入訊息範例：幫我查詢所有待辦中的 Jira 任務..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <button
              className={`rounded-xl px-6 py-3 font-semibold transition-all shadow-lg shadow-blue-900/20 ${
                isLoading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
              }`}
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
