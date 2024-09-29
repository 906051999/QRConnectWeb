'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function WiFiConnector({ ssid, password, encryptionType, isHidden }) {
  const [status, setStatus] = useState('准备连接');
  const [scanLog, setScanLog] = useState('');

  useEffect(() => {
    setScanLog('组件已加载');
  }, []);

  const wifiString = useMemo(() => (
    `WIFI:T:${encryptionType};S:${ssid};P:${password};H:${isHidden ? 'true' : 'false'};;`
  ), [ssid, password, encryptionType, isHidden]);

  const renderInfoItem = useCallback((label, value) => (
    <div className="flex items-center justify-between">
      <span className="text-gray-800">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  ), []);

  const connectToWifi = useCallback(() => {
    setStatus('请手动连接到WiFi');
    setScanLog(`
      请按照以下步骤连接WiFi：
      1. 打开设备的WiFi设置
      2. 查找并选择名为"${ssid}"的网络
      3. 输入密码: ${password}
      4. 点击连接
    `);
  }, [ssid, password]);

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
      <div className="mt-6 space-y-4">
        <button
          onClick={connectToWifi}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          连接到这个WiFi
        </button>
        <p className="text-sm text-gray-600 text-center">
          或使用其他设备扫描上方的二维码
        </p>
      </div>
      <div className="mt-4 p-2 bg-gray-100 rounded-lg">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">{scanLog}</pre>
      </div>
    </div>
  );
}