'use client';

import { useState } from 'react';
import QRCodeGenerator from '../components/Generator';

export default function Home() {
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full transform transition-all duration-300 hover:scale-105">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-800 tracking-tight">WiFi QR 生成器</h1>
        <QRCodeGenerator addLog={addLog} />
        <div className="mt-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-inner p-6 max-h-48 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">操作日志</h2>
            <button 
              onClick={clearLogs}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              清空日志
            </button>
          </div>
          <div className="space-y-2">
            {logs.map((log, index) => (
              <p key={index} className="text-sm text-gray-600 bg-white p-2 rounded-lg shadow-sm">{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}