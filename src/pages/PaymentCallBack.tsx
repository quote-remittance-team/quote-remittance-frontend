import { api } from '@/api/client';
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentCallBack = () => {
    
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

 const reference =
  searchParams.get('reference') ||
  localStorage.getItem('paymentReference');

  const [status, setStatus] = useState<string>('CHECKING');

  useEffect(() => {
    if (!reference) {
      navigate('/dashboard');
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await api.get(`/deposits/${reference}`);
        const depositStatus = res.data.status;

        setStatus(depositStatus);

        if (depositStatus === 'CONFIRMED') {
          navigate('/dashboard');
        } else if (depositStatus === 'FAILED') {
          navigate('/dashboard');
        }
      } catch (err) {
        setStatus('ERROR');
      }
    };

    checkStatus();

    // optional polling (important)
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [reference, navigate]);

  return ((
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-bold">Processing Payment...</h2>
        <p>Status: {status}</p>
      </div>
    </div>
  ))
}

export default PaymentCallBack;