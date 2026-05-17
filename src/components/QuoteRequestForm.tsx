import { isAxiosError } from 'axios';
import React, { useState } from 'react';

import { api } from '../api/client';

interface FormData {
  sendAmount: string | number;
  fromCurrency: string;
  toCurrency: string;
}

interface QuoteResponse {
  exchangeRate: number;
  fee: number;
  receiveAmount: number;
}

export default function QuoteRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    sendAmount: '',
    fromCurrency: 'NGN',
    toCurrency: 'USD',
  });

  const [quoteResult, setQuoteResult] = useState<QuoteResponse | null>(null);
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
    setIsLoading(true);
    setErrorMessage(null);
    setQuoteResult(null);
    try {
      const response = await api.post('/quotes', {
        sendAmount: Number(formData.sendAmount),
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
      });

      setQuoteResult(response.data);
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
        <form onSubmit={handleGetQuote} className="space-y-4">
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

        {quoteResult && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quote Details:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex justify-between">
                <span>Exchange Rate:</span>
                <span className="font-medium text-gray-900">{quoteResult.exchangeRate}</span>
              </li>
              <li className="flex justify-between">
                <span>Fee:</span>
                <span className="font-medium text-gray-900">
                  {quoteResult.fee}
                  {formData.fromCurrency}
                </span>
              </li>
              <li className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-bold text-gray-800">You Recieve:</span>
                <span className="font-bold text-gray-800 text-base">
                  {quoteResult.receiveAmount}
                  {formData.toCurrency}
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
