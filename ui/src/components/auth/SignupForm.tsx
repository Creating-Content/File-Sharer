// ui/src/components/auth/SignupForm.tsx
'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { saveAuthToken } from '@/utils/authUtils';

interface SignupFormProps {
  onSuccess: (username: string) => void;
  onSwitch: () => void;
  onHome: () => void;
}

export default function SignupForm({ onSuccess, onSwitch, onHome }: SignupFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Signup
      await axios.post('/auth/signup', { username, password });
      
      // Step 2: Auto-login
      await axios.post('/auth/login', { username, password }, {
        withCredentials: true
      });
      
      // Step 3: Save session and redirect
      saveAuthToken('session-active', username);
      alert('Account created successfully! You are now logged in.');
      onSuccess(username);

    } catch (err: unknown) {
      console.error('Signup error:', err);
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data ?? err.message ?? 'An error occurred during registration.';
        setError(String(msg));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Create Account</h2>
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
          className="btn-primary w-full block"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center text-sm">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-blue-600 hover:underline">
          Login
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