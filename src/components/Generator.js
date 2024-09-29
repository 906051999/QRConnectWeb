'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode.react';
import { encodeWiFiInfo, decodeWiFiInfo, setLogCallback } from '../lib/utils';

const encryptionOptions = [
  { value: 'WPA2', label: 'WPA2' },
  { value: 'WPA3', label: 'WPA3' },
  { value: 'WPA3WPA2', label: 'WPA3/WPA2' },
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: '开放(无密码)' }
];

export default function QRCodeGenerator({ addLog }) {
  const [wifiInfo, setWifiInfo] = useState({
    ssid: '',
    password: '',
    encryptionType: 'WPA2',
    isHidden: false
  });
  const [showPassword, setShowPassword] = useState(false);
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
    setPresetPrefixes([origin]);
    setLogCallback(addLog);
  }, [addLog]);

  const handleInputChange = useCallback(({ target: { name, value, type, checked } }) => {
    setWifiInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const toggleShowPassword = useCallback(() => setShowPassword(prev => !prev), []);

  const generateURL = useCallback(async () => {
    const { ssid, password, encryptionType, isHidden } = wifiInfo;
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
      addLog(`生成链接: ${generatedUrl}`);
      return generatedUrl;
    } catch (error) {
      console.error('Error generating URL:', error);
      setError(`生成链接时出错: ${error.message}`);
      addLog(`生成链接时出错: ${error.message}`);
      return '';
    }
  }, [wifiInfo, selectedPrefix, prefix, addLog]);

  const generateQRCode = useCallback(async () => {
    const generatedUrl = url || await generateURL();
    if (generatedUrl) {
      setQrValue(generatedUrl);
      addLog(`生成二维码: ${generatedUrl}`);
    }
  }, [url, generateURL, addLog]);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const encodedData = encodeWiFiInfo(wifiInfo.ssid, wifiInfo.password, wifiInfo.encryptionType, wifiInfo.isHidden);
      setQrValue(encodedData);
      addLog(`编码数据: ${encodedData}`);

      // 测试解码
      const decodedData = decodeWiFiInfo(encodedData);
      addLog(`解码数据: ${JSON.stringify(decodedData)}`);
    } catch (error) {
      addLog(`错误: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="space-y-4 w-full">
        <InputField
          type="text"
          name="ssid"
          value={wifiInfo.ssid}
          onChange={handleInputChange}
          placeholder="WiFi SSID"
          icon={<WifiIcon />}
        />
        <InputField
          type={showPassword ? "text" : "password"}
          name="password"
          value={wifiInfo.password}
          onChange={handleInputChange}
          placeholder="WiFi Password"
          icon={<LockIcon />}
          rightIcon={
            <TogglePasswordVisibility
              showPassword={showPassword}
              onClick={toggleShowPassword}
            />
          }
        />
        <div className="flex items-center space-x-4">
          <select
            name="encryptionType"
            value={wifiInfo.encryptionType}
            onChange={handleInputChange}
            className="block w-1/2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ease-in-out text-gray-800"
          >
            {encryptionOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isHidden"
              checked={wifiInfo.isHidden}
              onChange={handleInputChange}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <span className="text-gray-700">隐藏网络</span>
          </label>
        </div>
      </div>
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
        <Button onClick={generateQRCode} className="bg-blue-500 hover:bg-blue-600">
          生成二维码
        </Button>
        <Button onClick={generateURL} className="bg-green-500 hover:bg-green-600">
          生成链接
        </Button>
      </div>
      {error && <ErrorMessage message={error} />}
      {url && <URLDisplay url={url} />}
      {qrValue && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <QRCode value={qrValue} size={256} />
        </div>
      )}
    </div>
  );
}

const InputField = ({ type, name, value, onChange, placeholder, icon, rightIcon }) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="block w-full p-3 pl-10 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ease-in-out text-gray-800"
    />
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
      {icon}
    </span>
    {rightIcon && (
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {rightIcon}
      </span>
    )}
  </div>
);

const Button = ({ onClick, className, children }) => (
  <button
    onClick={onClick}
    className={`${className} text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105`}
  >
    {children}
  </button>
);

const ErrorMessage = ({ message }) => (
  <div className="w-full max-w-md bg-red-100 p-4 rounded-lg shadow-md">
    <p className="text-sm text-red-600">{message}</p>
  </div>
);

const URLDisplay = ({ url }) => (
  <div className="w-full max-w-md bg-gray-100 p-4 rounded-lg shadow-md">
    <p className="text-sm text-gray-600 mb-2">生成的链接：</p>
    <a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-blue-600 hover:text-blue-800 cursor-pointer">
      {url}
    </a>
  </div>
);

const WifiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const TogglePasswordVisibility = ({ showPassword, onClick }) => (
  <button onClick={onClick} className="text-gray-400 hover:text-gray-600">
    {showPassword ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
      </svg>
    )}
  </button>
);