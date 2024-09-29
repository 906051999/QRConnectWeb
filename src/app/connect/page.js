'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import WiFiConnector from '../../components/WiFiConnector';
import { decodeWiFiInfo, setLogCallback } from '@/lib/utils';
import Ad from '../../components/Gap';

function ConnectContent() {
  const searchParams = useSearchParams();
  const encodedInfo = searchParams.get('info');
  const [wifiInfo, setWifiInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAd, setShowAd] = useState(true);
  const [countdown, setCountdown] = useState(Math.floor(Math.random() * 5) + 3);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogCallback(addLog);
  }, []);

  useEffect(() => {
    let timer;
    if (showAd && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showAd, countdown]);

  useEffect(() => {
    async function decodeInfo() {
      if (encodedInfo) {
        try {
          setIsLoading(true);
          addLog('开始解码 WiFi 信息...');
          const result = await decodeWiFiInfo(encodedInfo);
          if (result.ssid) {
            setWifiInfo(result);
            addLog(`成功解码 WiFi 信息: SSID - ${result.ssid}`);
          } else {
            setError(result.error || '无法解码 WiFi 信息');
            addLog('解码失败: ' + (result.error || '无法解码 WiFi 信息'));
          }
        } catch (err) {
          console.error('解码 WiFi 信息时出错:', err);
          setError('解码 WiFi 信息时出错');
          addLog('解码出错: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setError('未提供 WiFi 信息');
        addLog('错误: 未提供 WiFi 信息');
      }
    }
    if (!showAd) {
      decodeInfo();
    }
  }, [encodedInfo, showAd]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleCloseAd = () => {
    if (countdown === 0) {
      setShowAd(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full transform transition-all duration-300 hover:scale-105">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-indigo-800 tracking-tight">WiFi 连接</h1>
        {showAd ? (
          <div className="relative">
            <Ad />
            <button
              onClick={handleCloseAd}
              className={`absolute top-2 right-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                countdown === 0 ? 'bg-indigo-500 text-white cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={countdown > 0}
            >
              {countdown > 0 ? countdown : '关闭'}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <p className="text-lg text-center text-red-500 font-semibold bg-red-100 p-4 rounded-lg">{error}</p>
        ) : wifiInfo ? (
          <WiFiConnector ssid={wifiInfo.ssid} password={wifiInfo.password} encryptionType={wifiInfo.encryptionType} isHidden={wifiInfo.isHidden} />
        ) : (
          <p className="text-lg text-center text-gray-600 font-medium bg-gray-100 p-4 rounded-lg">未找到 WiFi 信息</p>
        )}
        
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

export default function Connect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectContent />
    </Suspense>
  );
}