'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode.react';
import { encodeWiFiInfo } from '../lib/utils';

export default function QRCodeGenerator({ ssid, password, encryptionType, isHidden }) {
  const [qrValue, setQrValue] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [prefix, setPrefix] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [presetPrefixes, setPresetPrefixes] = useState([]);

  useEffect(() => {
    const origin = window.location.origin;
    setPrefix(origin);
    setSelectedPrefix(origin);
    setPresetPrefixes([
      origin,
      'http://192.168.31.125:3000',
    ]);
  }, []);

  const generateURL = useCallback(async () => {
    if (!ssid) {
      setError('SSID 不能为空');
      return '';
    }
    if (encryptionType !== 'nopass' && !password) {
      setError('密码不能为空');
      return '';
    }
    setError('');
    try {
      const encodedInfo = await encodeWiFiInfo(ssid, password, encryptionType, isHidden);
      const generatedUrl = `${selectedPrefix === 'custom' ? prefix : selectedPrefix}/connect?info=${encodedInfo}`;
      setUrl(generatedUrl);
      return generatedUrl;
    } catch (error) {
      console.error('Error generating URL:', error);
      setError('生成链接时出错');
      return '';
    }
  }, [ssid, password, encryptionType, isHidden, selectedPrefix, prefix]);

  const generateQRCode = useCallback(async () => {
    const generatedUrl = url || await generateURL();
    if (generatedUrl) {
      setQrValue(generatedUrl);
    }
  }, [url, generateURL]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-md">
        <select
          value={selectedPrefix}
          onChange={(e) => setSelectedPrefix(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-gray-800 text-base"
        >
          {presetPrefixes.map((preset, index) => (
            <option key={index} value={preset} className="text-gray-800">{preset}</option>
          ))}
          <option value="custom" className="text-gray-800">自定义</option>
        </select>
        {selectedPrefix === 'custom' && (
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="输入自定义前缀"
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-800 text-base placeholder-gray-500"
          />
        )}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={generateQRCode}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
        >
          生成二维码
        </button>
        <button
          onClick={generateURL}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
        >
          生成链接
        </button>
      </div>
      {error && (
        <div className="w-full max-w-md bg-red-100 p-4 rounded-lg shadow-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {url && (
        <div className="w-full max-w-md bg-gray-100 p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600 mb-2">生成的链接：</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-blue-600 hover:text-blue-800 cursor-pointer">
            {url}
          </a>
        </div>
      )}
      {qrValue && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <QRCode value={qrValue} size={256} />
        </div>
      )}
    </div>
  );
}