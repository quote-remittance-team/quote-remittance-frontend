import { isAxiosError } from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api, USER_ID_KEY } from '../api/client';

interface FormData {
  sendAmount: string | number;
  fromCurrency: string;
  toCurrency: string;
  userId: string;
}

export default function QuoteRequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    sendAmount: '',
    fromCurrency: 'NGN',
    toCurrency: 'USD',
    userId: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGetQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amountToCheck = Number(formData.sendAmount);
    if (!formData.sendAmount || amountToCheck <= 0) {
      setErrorMessage('Please enter a valid send amount greater than 0');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const currentUserId = localStorage.getItem(USER_ID_KEY);
      const response = await api.post('/quotes', {
        userId: currentUserId || '',
        sendAmount: Number(formData.sendAmount),
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
      });

      navigate('/deposit', {
        state: {
          quoteResult: response.data,
          requestData: formData,
        },
      });
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setErrorMessage('Your session has expired. Please login again');
        } else if (error.response?.status === 400) {
          setErrorMessage('Invalid quote data. Please check your inputs');
        } else {
          setErrorMessage('Server error. Please try agan later');
        }
      } else if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          setErrorMessage('You need to sign in to request a quote. Please login and try again.');
        } else {
          console.error('Submission failed:', error.message);
          setErrorMessage('Unable to process request. Please check connection');
        }
      } else {
        console.error('An unkown error occured:', error);
        setErrorMessage('An unexpected error occured. The server is unreachable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md mx-auto mt-4 p-6 bg-white rounded-lg shadow-md sm:mt-10 sm:p-8 border border-blue-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Request a Quote</h2>
        <form noValidate onSubmit={handleGetQuote} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Send Amount</label>
            <input
              type="number"
              name="sendAmount"
              value={formData.sendAmount}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g 5000"
            />
          </div>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700">From Currency</label>
              <select
                name="fromCurrency"
                value={formData.fromCurrency}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="NGN">Naira (NGN)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700">To Currency</label>
              <select
                name="toCurrency"
                value={formData.toCurrency}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="NGN">Naira (NGN)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium"
          >
            {isLoading ? 'Getting Quote...' : 'Get Quote'}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
