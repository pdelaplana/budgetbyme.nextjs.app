'use client';

import { useEffect, useState } from 'react';

interface DebugInfo {
  pwaElementsLoaded: boolean;
  capacitorAvailable: boolean;
  cameraAvailable: boolean | null;
  userAgent: string;
  isHTTPS: boolean;
}

export default function CameraDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    pwaElementsLoaded: false,
    capacitorAvailable: false,
    cameraAvailable: null,
    userAgent: '',
    isHTTPS: false,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkDebugInfo = async () => {
      // Check PWA elements
      const pwaElementsLoaded = !!(
        window as unknown as {
          customElements?: { get: (name: string) => unknown };
        }
      ).customElements?.get('pwa-camera-modal');

      // Check Capacitor
      const capacitorAvailable = !!(
        window as unknown as { Capacitor?: unknown }
      ).Capacitor;

      // Check HTTPS
      const isHTTPS =
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost';

      // Check camera availability
      let cameraAvailable: boolean | null = null;
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ video: true });
          cameraAvailable = true;
        }
      } catch (error) {
        cameraAvailable = false;
        console.log('Camera check error:', error);
      }

      setDebugInfo({
        pwaElementsLoaded,
        capacitorAvailable,
        cameraAvailable,
        userAgent: navigator.userAgent,
        isHTTPS,
      });
    };

    // Wait a bit for PWA elements to load
    setTimeout(checkDebugInfo, 2000);
  }, []);

  if (!isVisible) {
    return (
      <button
        type='button'
        onClick={() => setIsVisible(true)}
        className='fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-blue-700 z-50'
      >
        🔍 Debug Camera
      </button>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-sm z-50'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-semibold text-gray-900'>Camera Debug</h3>
        <button
          type='button'
          onClick={() => setIsVisible(false)}
          className='text-gray-400 hover:text-gray-600'
        >
          ✕
        </button>
      </div>

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between'>
          <span>PWA Elements:</span>
          <span
            className={
              debugInfo.pwaElementsLoaded ? 'text-green-600' : 'text-red-600'
            }
          >
            {debugInfo.pwaElementsLoaded ? '✅ Loaded' : '❌ Not Loaded'}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span>Capacitor:</span>
          <span
            className={
              debugInfo.capacitorAvailable
                ? 'text-green-600'
                : 'text-yellow-600'
            }
          >
            {debugInfo.capacitorAvailable ? '✅ Available' : '⚠️ Web Mode'}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span>Camera Access:</span>
          <span
            className={
              debugInfo.cameraAvailable === true
                ? 'text-green-600'
                : debugInfo.cameraAvailable === false
                  ? 'text-red-600'
                  : 'text-gray-500'
            }
          >
            {debugInfo.cameraAvailable === true
              ? '✅ Available'
              : debugInfo.cameraAvailable === false
                ? '❌ Denied'
                : '⏳ Checking...'}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span>HTTPS:</span>
          <span
            className={debugInfo.isHTTPS ? 'text-green-600' : 'text-red-600'}
          >
            {debugInfo.isHTTPS ? '✅ Secure' : '❌ Insecure'}
          </span>
        </div>
      </div>

      <div className='mt-3 pt-3 border-t border-gray-200'>
        <p className='text-xs text-gray-500 break-all'>
          {debugInfo.userAgent.split(' ').slice(0, 3).join(' ')}
        </p>
      </div>

      <div className='mt-3 flex gap-2'>
        <button
          type='button'
          onClick={() => window.location.reload()}
          className='flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700'
        >
          🔄 Reload
        </button>
        <button
          type='button'
          onClick={() => {
            console.log('📊 Debug Info:', debugInfo);
            alert('Debug info logged to console');
          }}
          className='flex-1 bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700'
        >
          📊 Log Info
        </button>
      </div>
    </div>
  );
}
