'use client';

import { useState } from 'react';
import EmailPreferencesForm from '@/components/EmailPreferencesForm';

export default function EmailPreferencesPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would validate the email here
    // and possibly require authentication
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {!email ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-semibold mb-6">Enter Your Email</h1>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <EmailPreferencesForm email={email} />
        )}
      </div>
    </div>
  );
} 