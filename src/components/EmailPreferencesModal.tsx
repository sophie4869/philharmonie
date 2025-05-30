import { useState } from 'react';
import EmailPreferencesForm from './EmailPreferencesForm';

export default function EmailPreferencesModal({ show, onClose }) {
  const [email, setEmail] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="rounded-lg shadow-lg p-6 max-w-2xl w-full border-2 bg-white relative">
        <button
          className="absolute top-2 right-3 text-2xl font-bold focus:outline-none"
          onClick={() => {
            setEmail('');
            setIsEmailSubmitted(false);
            onClose();
          }}
          aria-label="Close"
        >
          ×
        </button>
        {!isEmailSubmitted ? (
          <form onSubmit={e => {
            e.preventDefault();
            setIsEmailSubmitted(true);
          }} className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" />
              </svg>
              <h2 className="text-2xl font-semibold">Enter Your Email</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
          <EmailPreferencesForm
            email={email}
            onSave={() => {
              setEmail('');
              setIsEmailSubmitted(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
} 