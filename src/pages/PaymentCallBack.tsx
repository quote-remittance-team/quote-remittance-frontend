import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {  remittanceService } from '@/api/client';

// 1. Declare the exact type matching your backend RemittanceResponse fields
interface RemittanceResponse {
  remittanceId: string;
  reference: string;
  sendAmount: number;     // The NGN deposited amount
  receiveAmount: number;  // The USD payout amount
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  error: string;
}

const PaymentCallBack = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference =
    searchParams.get('reference') ||
    localStorage.getItem('paymentReference');

  // Unified component visual states: 'CHECKING' | 'SUCCESS' | 'FAILED' | 'ERROR'
  const [status, setStatus] = useState<string>('CHECKING');
  const [remittanceData, setRemittanceData] = useState<RemittanceResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!reference) {
      navigate('/dashboard');
      return;
    }

    const verifyPaymentAndCreateRemittance = async () => {
      
      const token = localStorage.getItem('accessToken'); 

      if (!token) {
        console.warn("🔐 Auth token is empty or initializing... holding execution to avoid 403.");
        setStatus('CHECKING'); 
        return; 
      }

      try {
        setStatus('CHECKING');
        /* endpoint consuming */
        const data: RemittanceResponse = await remittanceService.verifyPayment(reference);
        
        setRemittanceData(data);
        
        if (data.status === 'PROCESSING' || data.status === 'COMPLETED') {
          setStatus('SUCCESS');
          // Clear transient storage items
          localStorage.removeItem('paymentReference');
        } else {
          setStatus('FAILED');
          setErrorMessage('The transaction status returned as unserviceable.');
        }
      } catch (error) {
        console.error(" Request caught in exception block:", err.response);
        setStatus('ERROR');
        setErrorMessage(
          error.response?.data?.message || 
          `Server authentication block or connection rejected (${error.response?.status || 'No Status Status'})`
        );
      }
    };

    verifyPaymentAndCreateRemittance();
  }, [reference, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        
        {/* STATE 1: VERIFYING / HANDSHAKING */}
        {status === 'CHECKING' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-indigo-400 opacity-75"></div>
              <div className="relative rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Processing Payment...</h2>
            <p className="text-sm text-gray-500">
              Verifying transaction with Paystack and compiling your transfer details.
            </p>
          </div>
        )}

        {/* STATE 2: SUCCESS VIEW (Renders your precise RemittanceResponse fields) */}
        {status === 'SUCCESS' && remittanceData && (
          <div className="flex flex-col items-center space-y-5 animate-fade-in">
            <div className="h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-3xl font-extrabold border border-green-200 shadow-sm">
              ✓
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Confirmed!</h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded mt-2 inline-block">
                Status: {remittanceData.status}
              </p>
            </div>

            {/* Type-Safe Digital Receipt */}
            <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Remittance ID:</span>
                <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">{remittanceData.remittanceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Reference:</span>
                <span className="font-mono font-medium text-gray-800">{remittanceData.reference}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between">
                <span className="text-gray-500">Deposited Amount:</span>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(remittanceData.sendAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payout Amount:</span>
                <span className="font-bold text-indigo-600">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(remittanceData.receiveAmount)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Logged on {new Date(remittanceData.createdAt).toLocaleString()}
            </p>

            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition duration-150 transform active:scale-95 text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* STATE 3: FAILED / ERROR VIEWS */}
        {(status === 'FAILED' || status === 'ERROR') && (
          <div className="flex flex-col items-center space-y-5">
            <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl font-bold border border-red-200 shadow-sm">
              ✕
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Verification Failed</h2>
            <div className="bg-red-50 text-red-700 text-xs font-mono p-4 rounded-xl w-full text-left border border-red-100 break-words">
              {errorMessage}
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 px-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl shadow-md transition duration-150 text-sm"
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentCallBack;