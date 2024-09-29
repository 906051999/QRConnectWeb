'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import WiFiConnector from '../../components/WiFiConnector';
import { decodeWiFiInfo } from '@/lib/utils';

export default function Connect() {
  const searchParams = useSearchParams();
  const encodedInfo = searchParams.get('info');
  const [wifiInfo, setWifiInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function decodeInfo() {
      if (encodedInfo) {
        try {
          setIsLoading(true);
          const result = await decodeWiFiInfo(encodedInfo);
          if (result.ssid) {
            setWifiInfo(result);
          } else {
            setError(result.error || '无法解码 WiFi 信息');
          }
        } catch (err) {
          console.error('解码 WiFi 信息时出错:', err);
          setError('解码 WiFi 信息时出错');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setError('未提供 WiFi 信息');
      }
    }
    decodeInfo();
  }, [encodedInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 tracking-tight">WiFi 连接</h1>
        {isLoading ? (
          <p className="text-lg text-center text-gray-600 animate-pulse">正在解码 WiFi 信息...</p>
        ) : error ? (
          <p className="text-lg text-center text-red-500 font-semibold">{error}</p>
        ) : wifiInfo ? (
          <WiFiConnector ssid={wifiInfo.ssid} password={wifiInfo.password} encryptionType={wifiInfo.encryptionType} isHidden={wifiInfo.isHidden} />
        ) : (
          <p className="text-lg text-center text-gray-600 font-medium">未找到 WiFi 信息</p>
        )}
      </div>
    </div>
  );
}