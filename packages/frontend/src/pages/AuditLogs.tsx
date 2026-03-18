import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../services/agentApi.js";
import { Link } from "react-router-dom";

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getAuditLogs();
        if (res.success) setLogs(res.data);
      } catch (err) {
        console.error("無法取得日誌", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0b0f19] p-8 font-sans text-gray-100">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-2xl font-bold text-transparent">系統審核日誌 (Audit Logs)</h1>
          <p className="mt-1 text-sm text-gray-400">追蹤所有 AI Agent 的工具取用與敏感操作</p>
        </div>
        <Link to="/" className="rounded-xl border border-gray-700 bg-gray-800/50 px-6 py-2 text-sm font-semibold transition-all hover:bg-gray-700">
          返回對話
        </Link>
      </header>

      <div className="flex-1 overflow-x-auto rounded-2xl border border-gray-800 bg-[#0f172a] shadow-2xl">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-gray-900/80 backdrop-blur-md">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">時間</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">執行者</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">動作</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">工具</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">狀態</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">輸入/輸出詳情</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  載入中...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  暫無日誌紀錄
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-white/5">
                  <td className="p-4 text-sm whitespace-nowrap text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">{log.username}</span>
                  </td>
                  <td className="p-4 text-sm font-medium">{log.action}</td>
                  <td className="p-4 font-mono text-sm text-purple-400">{log.toolName}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${log.status === "success" ? "border border-green-500/20 bg-green-500/10 text-green-500" : "border border-red-500/20 bg-red-500/10 text-red-500"}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <details className="group cursor-pointer">
                      <summary className="text-xs font-medium text-blue-500 transition-all hover:text-blue-400">查看詳情</summary>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-gray-800 bg-black/40 p-3 font-mono text-[10px]">
                          <div className="mb-2 border-b border-gray-800 pb-1 text-gray-500">INPUT</div>
                          <pre className="text-gray-300">{JSON.stringify(log.input, null, 2)}</pre>
                        </div>
                        <div className="rounded-lg border border-gray-800 bg-black/40 p-3 font-mono text-[10px]">
                          <div className="mb-2 border-b border-gray-800 pb-1 text-gray-500">OUTPUT</div>
                          <pre className="text-gray-300">{JSON.stringify(log.output, null, 2)}</pre>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
