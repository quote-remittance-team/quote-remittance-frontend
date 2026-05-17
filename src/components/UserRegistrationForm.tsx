import { isAxiosError } from 'axios';
import { useState } from 'react';

import { api } from '../api/client';

import { navigateTo } from '@/utils/navigation';

interface RegistrationData {
  //   firstName: string;
  //   lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  //   firstName?: string;
  //   lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegistrationData>({
    //    firstName: '',
    //    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    //    if (!formData.firstName.trim()) {
    //      newErrors.firstName = 'First name is required';
    //      isValid = false
    //   }

    //   if (!formData.lastName.trim()) {
    //       newErrors.lastName = 'Last name is required';
    //       isValid = false
    //   }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else {
      const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      if (!strongPasswordRegex.test(formData.password)) {
        newErrors.password =
          'Password must be 8+ character with at least 1 uppercase, 1 number and 1 symbol (!@#$%^&*)';
        isValid = false;
      }
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
        const payload = {
          //  firstName: formData.firstName,
          //  lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        };

        const response = await api.post('/users/register', payload);

        if (response.status === 200 || response.status === 201) {
          // eslint-disable-next-line no-console
          console.log('Registration Successful!');
          navigateTo('/login');
        }
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 409) {
            setGlobalError('An account with this email already exists.');
          } else if (error.response?.status === 400) {
            setGlobalError('Invalid registration data provided.');
          } else {
            setGlobalError('Server error occurred');
          }
        } else if (error instanceof Error) {
          console.error('Registration failed:', error.message);
          setGlobalError('Unable to process request. Please check your connection');
        } else {
          console.error('An unknown error occured:', error);
          setGlobalError('Unable to connect to the server.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create an Account</h2>
        {globalError && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded">{globalError}</div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/*  <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="John"
                            />
                            {fieldErrors.firstName && (
                                <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
                            )}
                        </div> 
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Doe"
                            />
                            {fieldErrors.lastName && (
                                <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
                            )}
                        </div>     */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="........"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className=" mt-1 text-sm font-medium text-gray-300 hover:text-gray-300"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="........"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className=" mt-1 text-sm font-medium text-gray-300 hover:text-gray-300"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
