import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

import { api } from '../api/client';

interface RouteState {
  quoteResult: {
    exchangeRate: number;
    fee: number;
    receiveAmount: number;
    quoteId?: string;
    expiresAt?: string;
  };
  requestData: {
    sendAmount: string | number;
    fromCurrency: string;
    toCurrency: string;
  };
}

const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function DepositPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RouteState | null;
  const [generatedTime] = useState<string>(new Date().toLocaleTimeString('en-US'));
  const [savedEmail] = useState(() => localStorage.getItem('userEmail'));

  const [globalError, setGlobalError] = useState<string>('');
  const [isInitializingPayment, setIsInitializingPayment] = useState<boolean>(false);

  // --- NEW BENEFICIARY INPUT STATES ---
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverBankCode, setReceiverBankCode] = useState<string>('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState<string>('');

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (state?.quoteResult?.expiresAt) {
      const expireTime = new Date(state.quoteResult.expiresAt).getTime();
      const currentTime = new Date().getTime();
      const diffSeconds = Math.max(0, Math.floor((expireTime - currentTime) / 1000));
      return diffSeconds > 0 ? diffSeconds : 0;
    }
    return 180;
  });

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

  if (!savedEmail) {
    return <Navigate to="/login" replace />;
  }

  if (!state || !state.quoteResult) {
    return <Navigate to="/request-quote" replace />;
  }

  const { quoteResult, requestData } = state;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const BASE_CURRENCY = 'NGN';
  const isForeignCurrency = requestData?.fromCurrency?.toUpperCase() !== BASE_CURRENCY;
  const normalizeAmount = isForeignCurrency
    ? Number(requestData?.sendAmount || 0) * Number(quoteResult?.exchangeRate || 0)
    : Number(requestData?.sendAmount || 0);

  const handleDeposit = async () => {
    setGlobalError('');

    // --- NEW VALIDATION CHECK ---
    if (!receiverName.trim() || !receiverBankCode.trim() || !receiverAccountNumber.trim()) {
      setGlobalError('Please fill out all recipient beneficiary details before processing payment.');
      return;
    }

    if (receiverAccountNumber.trim().length !== 10) {
      setGlobalError('Account number must be exactly 10 digits long.');
      return;
    }

    if (normalizeAmount < 100) {
      setGlobalError(
        'The minimum processing amount is 100 NGN. Please request a new quote with a higher amount',
      );
      return;
    }

    setIsInitializingPayment(true);

    try {
      // 1. Send the recipient details to your backend so the PENDING deposit captures them
      const response = await api.post('/deposits', {
        amount: normalizeAmount,
        quoteId: quoteResult?.quoteId,
        idempotencyKey: generateIdempotencyKey(),
        receiverName: receiverName.trim(),
        receiverBankCode: receiverBankCode.trim(),
        receiverAccountNumber: receiverAccountNumber.trim(),
      });

      const { checkoutUrl, paymentReference } = response.data;

      if (checkoutUrl && paymentReference) {
        // 2. Commit transaction context properties completely to client storage fallback arrays
        localStorage.setItem('paymentReference', paymentReference);
        localStorage.setItem('depositQuoteId', quoteResult?.quoteId || '');
        localStorage.setItem('cachedReceiverName', receiverName.trim());
        localStorage.setItem('cachedReceiverBankCode', receiverBankCode.trim());
        localStorage.setItem('cachedReceiverAccountNumber', receiverAccountNumber.trim());

        window.location.href = checkoutUrl;
      } else {
        setGlobalError('Missing checkoutUrl or paymentReference from backend');
      }
    } catch (error) {
      let serverMessage = 'could not initiate transaction with the server.';
      if (isAxiosError(error)) {
        serverMessage = error.response?.data?.message || serverMessage;
      } else if (error instanceof Error) {
        serverMessage = error.message;
      }
      setGlobalError(serverMessage);
    } finally {
      setIsInitializingPayment(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md p-6 mx-auto bg-white border border-blue-200 rounded-lg shadow-md sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Deposit details</h2>
          <p className="text-xs text-gray-500 mt-1">
            Quote Reference: {quoteResult?.quoteId || 'N/A'}
          </p>
        </div>
        
        {globalError && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
            {globalError}
          </div>
        )}

        {/* QUOTE BREAKDOWN CARD */}
        <div className="p-5 border border-gray-200 rounded-md bg-gray-50">
          <ul className="space-y-4 text-sm text-gray-600">
            <li className="flex justify-between pb-3 border-b border-gray-200">
              <span>You are sending:</span>
              <span className="font-bold text-gray-900">
                {requestData?.sendAmount} {requestData?.fromCurrency}
              </span>
            </li>
            <li className="flex justify-between pt-2">
              <span>Exchange Rate:</span>
              <span className="font-medium text-gray-900">{quoteResult?.exchangeRate}</span>
            </li>
            <li className="flex justify-between">
              <span>Processing Fee:</span>
              <span className="font-medium text-gray-900">
                {quoteResult?.fee} {requestData?.fromCurrency}
              </span>
            </li>
            <li className="flex justify-between pt-4 mt-2 border-t border-gray-300">
              <span className="text-base font-bold text-gray-800">Recipient Receives:</span>
              <span className="text-xl font-extrabold text-green-600">
                {quoteResult?.receiveAmount} {requestData?.toCurrency}
              </span>
            </li>
          </ul>
        </div>

        {/* --- NEW SECTION: RECIPIENT ACCOUNT DETAILS FORM --- */}
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Recipient Payout Destination
          </h3>
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Receiver Full Name
            </label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="e.g. Tolulope Olanrewaju"
              disabled={isInitializingPayment}
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Bank Code
              </label>
              <input
                type="text"
                value={receiverBankCode}
                onChange={(e) => setReceiverBankCode(e.target.value)}
                placeholder="044"
                maxLength={4}
                disabled={isInitializingPayment}
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm font-mono text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={receiverAccountNumber}
                onChange={(e) => setReceiverAccountNumber(e.target.value.replace(/\D/g, ''))} // Digits only
                placeholder="10-digit number"
                maxLength={10}
                disabled={isInitializingPayment}
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
        {/* --- END OF NEW FORM SECTION --- */}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-800 space-y-1">
          <span className="font-medium">Generated At:</span>
          <span>{generatedTime}</span>
        </div>

        <div className="flex justify-between mt-4">
          <span className="font-medium flex items-center">Guaranteed Until:</span>
          <span className="font-bold text-red-600">{displayTime}</span>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleDeposit}
            disabled={isInitializingPayment}
            className={`w-full p-3 text-lg font-medium text-white transition-colors rounded-md ${
              isInitializingPayment
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isInitializingPayment ? 'Connecting to Server...' : 'Deposit & send'}
          </button>

          <button
            onClick={() => navigate(-1)}
            disabled={isInitializingPayment}
            className="w-full p-3 font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel / Edit Quote
          </button>
        </div>
      </div>
    </div>
  );
}