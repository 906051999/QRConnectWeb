'use client';

import { useState, useMemo, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function WiFiConnector({ ssid, password, encryptionType, isHidden }) {
  const [status, setStatus] = useState('准备连接');
  const [isConnecting, setIsConnecting] = useState(false);

  const wifiString = useMemo(() => (
    `WIFI:T:${encryptionType};S:${ssid};P:${password};H:${isHidden ? 'true' : 'false'};;`
  ), [ssid, password, encryptionType, isHidden]);

  const connectToWiFi = useCallback(async () => {
    setIsConnecting(true);
    setStatus('正在连接...');

    try {
      if ('wifi' in navigator) {
        await navigator.wifi.requestPermission();
        const network = await navigator.wifi.connect({
          ssid,
          password,
          encryptionType,
          hidden: isHidden
        });
        setStatus(`已成功连接到 ${network.ssid}`);
      } else if (/Android/i.test(navigator.userAgent)) {
        const intent = `intent://androidwifi#Intent;scheme=android-app;package=com.google.android.gms;S.wifi_string=${encodeURIComponent(wifiString)};end`;
        window.location.href = intent;
        setStatus('已发送连接请求，请在系统设置中确认');
      } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = wifiString;
        setStatus('已打开 WiFi 设置，请手动连接');
      } else {
        throw new Error('无法自动连接 WiFi，请手动连接');
      }
    } catch (error) {
      console.error('WiFi 连接失败:', error);
      setStatus(`连接失败: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, [ssid, password, encryptionType, isHidden, wifiString]);

  const renderInfoItem = useCallback((label, value) => (
    <div className="flex items-center justify-between">
      <span className="text-gray-800">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  ), []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4 mb-6">
        {renderInfoItem('SSID', ssid)}
        {renderInfoItem('密码', password)}
        {renderInfoItem('加密类型', encryptionType)}
        {renderInfoItem('隐藏网络', isHidden ? '是' : '否')}
        <div className="text-center text-gray-600">{status}</div>
      </div>
      <div className="mt-6 flex justify-center">
        <QRCodeSVG value={wifiString} size={200} />
      </div>
      <button
        onClick={connectToWiFi}
        disabled={isConnecting}
        className={`w-full mt-6 ${
          isConnecting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
      >
        {isConnecting ? '连接中...' : '连接 WiFi'}
      </button>
    </div>
  );
}