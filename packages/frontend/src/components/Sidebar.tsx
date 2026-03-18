import React from "react";
import { Link } from "react-router-dom";
import { useChatStore } from "../store/useChatStore.js";

interface SidebarProps {
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectConversation, onNewChat }) => {
  const { conversations, conversationId, isLoading, status } = useChatStore();

  return (
    <aside className="flex w-full flex-col border-b border-gray-800 bg-[#0f172a] p-6 md:w-80 md:border-r md:border-b-0">
      <div className="mb-4">
        <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">AI Ops Platform</h1>
        <p className="text-sm text-gray-400">智能運維助手</p>
      </div>

      <Link to="/audit-logs" className="group mb-8 flex items-center gap-1 text-xs font-semibold text-red-500/80 transition-all hover:text-red-400">
        <span>⚙️ 審核日誌 (Admin Only)</span>
      </Link>

      <button onClick={onNewChat} className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 py-3 text-sm font-semibold transition-all hover:bg-gray-700 active:scale-95">
        <span>＋</span> 開啟新對話
      </button>

      <div className="flex flex-1 flex-col overflow-hidden">
        <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">歷史紀錄</h2>
        <div className="scrollbar-thin scrollbar-thumb-gray-800 flex-1 space-y-2 overflow-y-auto pr-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full rounded-lg p-3 text-left text-sm transition-all hover:bg-white/5 ${conversationId === conv.id ? "border border-blue-500/50 bg-blue-600/20 text-blue-400" : "text-gray-400"}`}
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
  );
};

export default Sidebar;
