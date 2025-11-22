// ui/src/app/page.tsx
'use client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import FileDownload from '@/components/FileDownload';
import InviteCode from '@/components/InviteCode';
import ProfileSection from '@/components/ProfileSection';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { getAuthToken, getUsername, logout as clientLogout, getGuestId, setGuestId } from '@/utils/authUtils';
import { FiUser, FiLogOut, FiHome, FiCheck } from 'react-icons/fi';

type ActiveTab = 'upload' | 'download' | 'profile' | 'login' | 'signup';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [guestUploadCount, setGuestUploadCount] = useState(0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const username = getUsername();
    if (token && username) {
      setIsLoggedIn(true);
      setCurrentUsername(username);
      // Reset guest count when logged in
      localStorage.setItem('guestUploadCount', '0');
      setGuestUploadCount(0);
    } else {
      // Load guest count only if not logged in
      const count = parseInt(localStorage.getItem('guestUploadCount') || '0');
      setGuestUploadCount(count);
    }
    
    if (!getGuestId()) {
      setGuestId();
    }
  }, []);

  const handleLoginSuccess = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUsername(username);
    setActiveTab('upload');
    // Reset guest count on login
    localStorage.setItem('guestUploadCount', '0');
    setGuestUploadCount(0);
  };

  const handleLogout = () => {
    clientLogout();
    setIsLoggedIn(false);
    setCurrentUsername(null);
    setActiveTab('upload');
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setShareCode(null);
    
    if (!isLoggedIn && guestUploadCount >= 2) {
        setIsUploading(false);
        alert('You have reached the free upload limit (2 files). Please sign up or login to continue.');
        setActiveTab('login');
        return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (!isLoggedIn) {
        formData.append('guestId', getGuestId() || '');
      }
      
      const response = await axios.post('/files/upload', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setShareCode(response.data.shareCode);
      
      if (!isLoggedIn) {
        const newCount = guestUploadCount + 1;
        setGuestUploadCount(newCount);
        localStorage.setItem('guestUploadCount', newCount.toString());
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDownload = async (shareCode: string) => {
    setIsDownloading(true);
    
    try {
      const response = await axios.get(`/files/download/${shareCode}`);
      const redirectUrl = response.data.redirectUrl;
      
      if (redirectUrl) {
        // Open in new tab to trigger download
        window.open(redirectUrl, '_blank');
      } else {
        throw new Error('No download link provided.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please check the invite code and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
        case 'login':
            return <LoginForm onSuccess={handleLoginSuccess} onSwitch={() => setActiveTab('signup')} onHome={() => setActiveTab('upload')} />;
        case 'signup':
            return <SignupForm onSuccess={handleLoginSuccess} onSwitch={() => setActiveTab('login')} onHome={() => setActiveTab('upload')} />;
        case 'profile':
            return <ProfileSection onLogout={handleLogout} />;
        case 'upload':
            return (
                <>
                    <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
                    {uploadedFile && !isUploading && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">
                                Selected file: <span className="font-medium">{uploadedFile.name}</span> ({Math.round(uploadedFile.size / 1024)} KB)
                            </p>
                        </div>
                    )}
                    {isUploading && (
                        <div className="mt-6 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-2 text-gray-600">Uploading file...</p>
                        </div>
                    )}
                    {shareCode && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                            <div className="flex items-center mb-3">
                                <div className="bg-green-500 rounded-full p-2 mr-3">
                                    <FiCheck className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-green-800">File Uploaded Successfully!</h3>
                            </div>
                            <p className="text-sm text-green-700 mb-4">
                                Share this code with anyone to let them download your file:
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white p-4 rounded-lg border-2 border-green-300 font-mono text-2xl font-bold text-center text-green-700">
                                    {shareCode}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareCode);
                                        alert('Share code copied!');
                                    }}
                                    className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                                >
                                    Copy
                                </button>
                            </div>
                            {!isLoggedIn && guestUploadCount < 2 && (
                                <p className="mt-4 text-sm text-gray-600">
                                    You have {2 - guestUploadCount} free upload{2 - guestUploadCount > 1 ? 's' : ''} remaining.
                                </p>
                            )}
                        </div>
                    )}
                </>
            );
        case 'download':
            return (
                <>
                    <FileDownload onDownload={handleDownload} isDownloading={isDownloading} />
                    {isDownloading && (
                        <div className="mt-6 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-2 text-gray-600">Downloading file...</p>
                        </div>
                    )}
                </>
            );
        default:
            return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
          {activeTab === 'profile' ? (
            <button onClick={() => setActiveTab('upload')} className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <FiHome className="mr-2" size={20} />
              Home
            </button>
          ) : (
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PeerLink</h1>
              <p className="text-sm text-gray-500">Secure File Sharing</p>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {!isLoggedIn && (
              <div className="text-sm text-gray-600">
                Free uploads: <span className="font-bold text-blue-600">{guestUploadCount}/2</span>
              </div>
            )}
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 rounded-lg font-medium transition-all flex items-center bg-blue-600 text-white hover:bg-blue-700"
                >
                  <FiUser className="mr-2" />
                  {currentUsername}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium transition-all flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                Login / Signup
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {['upload', 'download'].includes(activeTab) && (
            <div className="flex border-b bg-gray-50">
              <button
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'upload' 
                    ? 'text-blue-600 border-b-3 border-blue-600 bg-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('upload')}
              >
                📤 Share a File
              </button>
              <button
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'download' 
                    ? 'text-blue-600 border-b-3 border-blue-600 bg-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('download')}
              >
                📥 Receive a File
              </button>
            </div>
          )}
          
          <div className="p-8 flex justify-center">
            <div className="w-full max-w-md">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>PeerLink © {new Date().getFullYear()} • Secure File Sharing Platform</p>
      </footer>
    </div>
  );
}
