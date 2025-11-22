// ui/src/components/filedownload.tsx
'use client';

import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

interface FileDownloadProps {
  onDownload: (shareCode: string) => Promise<void>; // Changed port to shareCode (string)
  isDownloading: boolean;
}

export default function FileDownload({ onDownload, isDownloading }: FileDownloadProps) {
  const [shareCode, setShareCode] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedCode = shareCode.trim();

    if (!trimmedCode) {
      setError('Please enter a share code.');
      return;
    }
    
    try {
      await onDownload(trimmedCode);
    } catch (err) {
      setError('Failed to download the file. Please check the code and try again.');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Receive a File</h3>
        <p className="text-sm text-blue-600 mb-0">
          Enter the share code shared with you to download the file.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="shareCode" className="block text-sm font-medium text-gray-700 mb-1">
            Share Code
          </label>
          <input
            type="text"
            id="shareCode"
            value={shareCode}
            onChange={(e) => setShareCode(e.target.value)}
            placeholder="Enter the 5-digit share code"
            className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 tracking-widest"
            disabled={isDownloading}
            required
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        <button
          type="submit"
          className="btn-primary flex items-center justify-center w-full"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <span>Requesting Download...</span>
          ) : (
            <>
              <FiDownload className="mr-2" />
              <span>Download File</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
