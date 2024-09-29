import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const Ad = () => {
  const [adContent, setAdContent] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [randomImageSeed, setRandomImageSeed] = useState(Math.random());

  const defaultAd = {
    title: "默认广告",
    description: "这是一个默认广告，当无法从API获取广告时显示。",
    cta: "了解更多",
    image: `https://picsum.photos/300/200?random=${randomImageSeed}`
  };

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://api.example.com/ads', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        setAdContent(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('获取广告超时');
        } else {
          console.error('获取广告失败:', error);
        }
        // 保持默认广告不变
      }
    };

    fetchAd();
  }, []);

  const currentAd = adContent || defaultAd;

  const handleContactClick = (e) => {
    e.preventDefault();
    setShowContact(true);
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-xl shadow-lg my-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300 rounded-bl-full transform rotate-45 -translate-x-10 -translate-y-10"></div>
      <div className="relative w-full h-48 mb-4">
        <Image
          src={currentAd.image}
          alt={currentAd.title}
          layout="fill"
          objectFit="cover"
          className="rounded-lg shadow-md"
        />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{currentAd.title}</h3>
      <p className="text-md text-gray-600 mb-4 leading-relaxed">{currentAd.description}</p>
      <button
        onClick={handleContactClick}
        className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105 shadow-md"
      >
        {currentAd.cta}
      </button>
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-95 hover:scale-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">联系我们</h2>
            <div className="space-y-4 mb-6">
              <p className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                电话：123-456-7890
              </p>
              <p className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                邮箱：contact@example.com
              </p>
            </div>
            <button
              onClick={() => setShowContact(false)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-600 transition duration-300 transform hover:scale-105 shadow-md"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ad;
