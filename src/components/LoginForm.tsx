import { isAxiosError } from 'axios';
import { useState } from 'react';

import { api, ACCESS_TOKEN_KEY } from '../api/client';

import { navigateTo } from '@/utils/navigation';

interface LoginCredentials {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!credentials.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (validateForm()) {
      setIsLoading(true);

      try {
        const response = await api.post('/auth/login', credentials);

        if (response.status === 200) {
          const token = response.data.token;

          if (token) {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
          }
          // eslint-disable-next-line no-console
          console.log('Login successful! Token secured.');
          navigateTo('/dashboard');
        }
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 403 || error.response?.status === 401) {
            setGlobalError('Invalid email or password. Please try again');
          } else {
            setGlobalError('Unable to connect to the server. Please check your connection.');
          }
        } else if (error instanceof Error) {
          if (error.message === 'Unauthorized') {
            setGlobalError('Invalid email or password. Please try again');
          } else {
            console.error('Login failed:', error.message);
            setGlobalError('Unable to connect to th server. Please check your connection.');
          }
        } else {
          console.error('An unkown error occured:', error);
          setGlobalError('Unable to connect to the server. Please check your connection');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Sign In to Your Account</h2>
        {globalError && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded">{globalError}</div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">Email</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="......."
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className=" mt-1 text-sm font-medium text-gray-300 hover:text-gray-300"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>

            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
