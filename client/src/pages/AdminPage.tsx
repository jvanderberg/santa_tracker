import { useState, useEffect } from 'react';
import { adminLogin, testAdminAuth } from '../services/api';

export function AdminPage() {
  const [passphrase, setPassphrase] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = sessionStorage.getItem('adminToken');
    if (existingToken) {
      setIsLoading(true);
      testAdminAuth(existingToken)
        .then(isValid => {
          if (isValid) {
            setIsAuthenticated(true);
          } else {
            // Clear invalid token
            sessionStorage.removeItem('adminToken');
          }
        })
        .catch(() => {
          sessionStorage.removeItem('adminToken');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthFailed(false);

    try {
      // Step 1: Login with passphrase to get token
      const jwtToken = await adminLogin(passphrase);

      // Step 2: Test the token against admin endpoint
      const isValid = await testAdminAuth(jwtToken);

      if (isValid) {
        // Store token in sessionStorage
        sessionStorage.setItem('adminToken', jwtToken);
        setIsAuthenticated(true);
      } else {
        setAuthFailed(true);
      }
    } catch (_error) {
      setAuthFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Authenticated</h1>
          <p className="text-gray-600">You are successfully authenticated as an admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 mb-2">
              Passphrase
            </label>
            <input
              type="password"
              id="passphrase"
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin passphrase"
              required
            />
          </div>

          {authFailed && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">Failed to authenticate</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Authenticating...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
