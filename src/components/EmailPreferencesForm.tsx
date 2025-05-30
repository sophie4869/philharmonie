import { useState, useEffect, useCallback } from 'react';
import { FiMail, FiX } from 'react-icons/fi';

interface EmailPreferencesFormProps {
  email: string;
  onSave?: () => void;
}

interface Musician {
  name: string;
  role?: string;
}

interface Concert {
  musicians: Musician[];
}

export default function EmailPreferencesForm({ email, onSave }: EmailPreferencesFormProps) {
  const [subscribedMusicians, setSubscribedMusicians] = useState<Musician[]>([]);
  const [digestFrequency, setDigestFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [availableMusicians, setAvailableMusicians] = useState<Musician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch(`/api/email-preferences?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.subscribedMusicians) {
        setSubscribedMusicians(data.subscribedMusicians);
      }
      if (data.digestFrequency) {
        setDigestFrequency(data.digestFrequency);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [email]);

  useEffect(() => {
    fetchPreferences();
    fetchMusicians();
  }, [email, fetchPreferences]);

  const fetchMusicians = async () => {
    try {
      const response = await fetch('/api/concerts');
      if (!response.ok) {
        throw new Error('Failed to fetch concerts');
      }
      
      const concerts: Concert[] = await response.json();
      if (!Array.isArray(concerts)) {
        throw new Error('Invalid concerts data format');
      }

      const musicians = new Set<string>();
      const musicianRoles = new Map<string, string>();

      concerts.forEach((concert) => {
        if (concert && Array.isArray(concert.musicians)) {
          concert.musicians.forEach((musician) => {
            if (musician && musician.name) {
              musicians.add(musician.name);
              if (musician.role) {
                musicianRoles.set(musician.name, musician.role);
              }
            }
          });
        }
      });

      const uniqueMusicians = Array.from(musicians).map(name => ({
        name,
        role: musicianRoles.get(name)
      })).sort((a, b) => a.name.localeCompare(b.name));

      setAvailableMusicians(uniqueMusicians);
    } catch (error) {
      console.error('Error fetching musicians:', error);
      setMessage('Failed to load musicians. Please try again later.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/email-preferences/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subscribedMusicians,
          digestFrequency,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Preferences saved successfully!');
        setShowSuccessModal(true);
      } else {
        setMessage(data.error || 'Failed to save preferences. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMusician = (musician: Musician) => {
    if (!subscribedMusicians.some(m => m.name === musician.name)) {
      setSubscribedMusicians([...subscribedMusicians, musician]);
    }
    setSearchTerm('');
  };

  const removeMusician = (index: number) => {
    setSubscribedMusicians(subscribedMusicians.filter((_, i) => i !== index));
  };

  const filteredMusicians = availableMusicians.filter(musician =>
    musician.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-6">
          <FiMail className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Email Preferences</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digest Frequency
            </label>
            <select
              value={digestFrequency}
              onChange={(e) => setDigestFrequency(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Musicians to subscribe to
              </label>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for a musician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {searchTerm && (
                <div className="mt-1 max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                  {filteredMusicians.map((musician) => (
                    <button
                      key={musician.name}
                      type="button"
                      onClick={() => addMusician(musician)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      <span className="font-medium">{musician.name}</span>
                      {musician.role && (
                        <span className="text-gray-500 ml-2">({musician.role})</span>
                      )}
                    </button>
                  ))}
                  {filteredMusicians.length === 0 && (
                    <div className="p-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Musician not found? Add them manually:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Musician name"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => addMusician({ name: searchTerm })}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {subscribedMusicians.map((musician, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium">{musician.name}</span>
                    {musician.role && (
                      <span className="text-gray-500 ml-2">({musician.role})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMusician(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-xl">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onSave?.();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <FiMail className="text-2xl text-green-600" />
              <h3 className="text-xl font-semibold">Preferences Saved</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Your email preferences have been successfully recorded. You will receive updates according to your selected preferences.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onSave?.();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 