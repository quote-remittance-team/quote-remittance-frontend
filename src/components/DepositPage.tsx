import { useEffect, useState, useRef } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

import { api } from '../api/client';

interface RouteState {
  quoteResult: {
    exchangeRate: number;
    fee: number;
    receiveAmount: number;
    quoteId?: string;
    expireAt?: string;
  };
  requestData: {
    sendAmount: string | number;
    fromCurrency: string;
    toCurrency: string;
  };
}

export default function DepositPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RouteState | null;
  const [generatedTime] = useState<string>(new Date().toLocaleTimeString());
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const savedEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate('/request-quote', { replace: true });
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  const { quoteResult, requestData } = state || {};

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const BASE_CURRENCY = 'NGN';
  const isForeignCurrency = requestData?.fromCurrency.toUpperCase() !== 'NGN';
  const normalizeAmount = isForeignCurrency
    ? Number(requestData?.sendAmount || 0) * Number(quoteResult?.exchangeRate || 0)
    : Number(requestData?.sendAmount || 0);
  const [backendReference, setBackendReference] = useState<string | undefined>(undefined);
  const hasOpened = useRef(false);
  const config = {
    amount: Math.round(normalizeAmount * 100),
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: savedEmail || 'user@example.com',
    currency: BASE_CURRENCY,
    reference: backendReference,
  };

  const initializePayment = usePaystackPayment(config);

  const handleStartDeposit = async () => {
    try {
      const response = await api.post('/deposits', {
        amount: normalizeAmount,
        quoteId: quoteResult?.quoteId,
        idempotencyKey: crypto.randomUUID(),
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        console.error('No checkout URL returned from backend:', response.data);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  const handleDeposit = (reference: unknown) => {
    //eslint-disable-next-line no-console
    console.log('Payment initialized:', reference);
    alert('Payment successful! your backend webhook is handling the validation database updates');
  };

  const onClose = () => {
    //eslint-disable-next-line no-console
    console.log('Payment workflow cancelled by user closing the overlay window.');
    setBackendReference(undefined);
    hasOpened.current = false;
  };
  useEffect(() => {
    if (backendReference && !hasOpened.current) {
      hasOpened.current = true;
      initializePayment({ onSuccess: handleDeposit, onClose: onClose });
    }
  }, [backendReference, initializePayment]);
  if (!state || !state.quoteResult) {
    return <Navigate to="/request-quote" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md p-6 mx-auto bg-white border border-blue-200 rounded-lg shadow-md sm:p-8">
        <div className="mb-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Deposit Details</h2>
          <p className="text-xs text-gray-500 mt-1">
            Quote Reference: {quoteResult?.quoteId || `REF-${Math.floor(Math.random() * 1000000)}`}
          </p>
        </div>
        <div className="p-5 border border-gray-200 rounded-md bg-gray-50">
          <ul className="space-y-4 text-sm text-gray-600">
            <li className="flex justify-between pb-3 border-b border-gray-200">
              <span>You are sending:</span>
              <span className="font-bold text-gray-900">
                {requestData?.sendAmount}
                {requestData?.fromCurrency}
              </span>
            </li>

            <li className="flex justify-between pt-2">
              <span>Exchange Rate:</span>
              <span className="font-medium text-gray-900">{quoteResult?.exchangeRate}</span>
            </li>

            <li className="flex justify-between">
              <span>Processing Fee:</span>
              <span className="font-medium text-gray-900">
                {quoteResult?.fee}
                {requestData?.fromCurrency}
              </span>
            </li>

            <li className="flex justify-between pt-4 mt-2 border-t border-gray-300">
              <span className="text-base font-bold text-gray-800">Recipient Receives:</span>
              <span className="text-xl font-extrabold text-green-600">
                {quoteResult?.receiveAmount}
                {requestData?.toCurrency}
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-800 space-y-1">
          <span className="font-medium">Generated At:</span>
          <span>{generatedTime}</span>
        </div>

        <div className="flex justify-between mt-4">
          <span className="font-medium flex items-center">Guranteed Until:</span>
          <span className="font-bold text-red-600">{displayTime}</span>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleStartDeposit}
            className="w-full p-3 text-lg font-medium text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
          >
            Deposit & send
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full p-3 font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel / Edit Quote
          </button>
        </div>
      </div>
    </div>
  );
}
