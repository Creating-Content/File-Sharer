// ui/src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { saveAuthToken } from '@/utils/authUtils';

interface LoginFormProps {
  onSuccess: (username: string) => void;
  onSwitch: () => void;
}

export default function LoginForm({ onSuccess, onSwitch }: LoginFormProps) {
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
      <h2 className="text-2xl font-bold text-gray-800 text-center">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      <p className="text-center text-sm">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-blue-600 hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
}