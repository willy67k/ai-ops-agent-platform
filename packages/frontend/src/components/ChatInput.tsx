import React from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, isLoading }) => {
  return (
    <div className="border-t border-gray-800 bg-[#0f172a]/80 p-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl gap-4">
        <input
          type="text"
          className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 transition-all placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="輸入訊息範例：幫我查詢所有待辦中的 Jira 任務..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSend()}
          disabled={isLoading}
        />
        <button
          className={`rounded-xl px-6 py-3 font-semibold shadow-lg shadow-blue-900/20 transition-all ${isLoading ? "cursor-not-allowed bg-gray-700 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"}`}
          onClick={onSend}
          disabled={isLoading}
        >
          送出
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
