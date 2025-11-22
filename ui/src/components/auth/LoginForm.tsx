// ui/src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { saveAuthToken } from '@/utils/authUtils';

interface LoginFormProps {
  onSuccess: (username: string) => void;
  onSwitch: () => void;
  onHome: () => void;
}

export default function LoginForm({ onSuccess, onSwitch, onHome }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/auth/login', { username, password }, {
        withCredentials: true // Enable session cookies
      });
      
      // Save username for display purposes (session is managed by cookies)
      saveAuthToken('session-active', username); 
      onSuccess(username);

    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="btn-primary w-full block text-base py-2"
          disabled={isLoading}
        >
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      <p className="text-center text-xs">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-blue-600 hover:underline">
          Sign up
        </button>
      </p>
      <button
        onClick={onHome}
        className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-all"
      >
        ← Back to Home
      </button>
    </div>
  );
}