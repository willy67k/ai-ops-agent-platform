import React from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  agentRole: string;
  onRoleChange: (role: string) => void;
  disabledRole: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, isLoading, agentRole, onRoleChange, disabledRole }) => {
  return (
    <div className="border-t border-gray-800 bg-[#0f172a]/80 p-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {/* 角色選擇器 */}
        {!disabledRole && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>選擇 Agent 角色:</span>
            <div className="flex gap-2">
              {["SRE", "Dev", "Sec"].map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={`cursor-pointer rounded-full px-3 py-1 transition-all ${agentRole === r ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-gray-800 hover:bg-gray-700"}`}
                >
                  {r} {r === "SRE" ? "運維" : r === "Dev" ? "開發" : "資安"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 transition-all placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder={disabledRole ? "繼續對話..." : "選擇角色後輸入訊息..."}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSend()}
            disabled={isLoading}
          />
          <button
            className={`cursor-pointer rounded-xl px-6 py-3 font-semibold shadow-lg shadow-blue-900/20 transition-all ${
              isLoading ? "cursor-not-allowed bg-gray-700 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"
            }`}
            onClick={onSend}
            disabled={isLoading}
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
