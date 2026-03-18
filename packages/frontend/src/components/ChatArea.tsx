import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStore } from "../store/useChatStore.js";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism/index.js";

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
          <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${msg.role === "user" ? "rounded-tr-none bg-blue-600 text-white" : "rounded-tl-none border border-gray-700 bg-[#1e293b]"}`}>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider opacity-60">{msg.role === "user" ? "YOU:" : "AGENT:"}</div>
            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter style={atomDark as any} language={match[1]} PreTag="div" className="!my-4 rounded-lg border border-gray-800 !bg-[#0b0f19]" {...props}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-blue-300" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-lg border border-gray-700">
                      <table className="w-full border-collapse text-left text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => <th className="border-b border-gray-700 bg-gray-800 p-2 font-bold">{children}</th>,
                  td: ({ children }) => <td className="border-b border-gray-800 p-2">{children}</td>,
                  ul: ({ children }) => <ul className="my-2 ml-6 list-disc space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="my-2 ml-6 list-decimal space-y-1">{children}</ol>,
                  a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                      {children}
                    </a>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatArea;
