import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage.js";
import AuditLogs from "./pages/AuditLogs.js";
import "./index.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
