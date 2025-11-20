// ui/src/components/ProfileSection.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getAuthToken, getUsername } from '@/utils/authUtils';
import { FiDownload, FiTrash2, FiRefreshCw, FiCalendar, FiFile } from 'react-icons/fi';

interface FileRecord {
  id: number;
  shareCode: string;
  originalFilename: string;
  uploadDate: string;
  downloadCount: number;
}

interface ProfileSectionProps {
    onLogout: () => void;
}

export default function ProfileSection({ onLogout }: ProfileSectionProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const username = getUsername();
  const token = getAuthToken();

  const getAuthConfig = () => ({
    withCredentials: true,
  });

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/files/user/history', getAuthConfig());
      setFiles(response.data);
    } catch (err) {
      setError('Failed to fetch file history. Session may have expired.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (shareCode: string) => {
    try {
      const response = await axios.get(`/files/download/${shareCode}`);
      const redirectUrl = response.data.redirectUrl; 
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('No download link provided.');
      }
    } catch (error) {
      alert('Failed to initiate download. Check the share code or server status.');
    }
  };

  const handleDelete = async (shareCode: string) => {
    if (!confirm(`Are you sure you want to delete file with code ${shareCode}?`)) return;

    try {
      await axios.delete(`/files/user/delete/${shareCode}`, getAuthConfig());
      alert('File deleted successfully!');
      fetchFiles();
    } catch (error) {
      alert('Failed to delete file. You may not own this file.');
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
        <button onClick={fetchFiles} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-6 border-b-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome back, <span className="text-blue-600">{username}</span>!
          </h2>
          <p className="text-gray-500 mt-1">Manage your uploaded files</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
          <FiFile className="mr-2" />
          Your File History
        </h3>
        <button 
          onClick={fetchFiles} 
          className="text-gray-500 hover:text-blue-600 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
        >
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-500 text-lg">No files uploaded yet</p>
          <p className="text-gray-400 text-sm mt-2">Start sharing files to see them here</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow-lg rounded-xl border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Share Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Downloads</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiFile className="text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{file.originalFilename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-sm font-mono bg-blue-100 text-blue-800 rounded-full">{file.shareCode}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{file.downloadCount} times</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-2" />
                      {new Date(file.uploadDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                    <button
                      onClick={() => handleDownload(file.shareCode)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-100 transition-all"
                      title="Download"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.shareCode)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-100 transition-all"
                      title="Delete File"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
