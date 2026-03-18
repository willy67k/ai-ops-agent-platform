import React from "react";
import { useChatStore } from "../store/useChatStore.js";

interface ChatAreaProps {
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ chatEndRef }) => {
  const { messages } = useChatStore();

  return (
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
  );
};

export default ChatArea;
