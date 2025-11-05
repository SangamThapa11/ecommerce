"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import axiosConfig from '@/config/axios.config';

interface PaymentResponse {
  pidx: string;
  txnId: string;
  amount: number;
  total_amount: number;
  mobile: string;
  status: string;
  transaction_id: string;
  fee: number;
  refunded: boolean;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [orderCode, setOrderCode] = useState<string>('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }

        // Get payment data from URL parameters
        const pidx = searchParams.get('pidx');
        const txnId = searchParams.get('txnId');
        const amount = searchParams.get('amount');
        const totalAmount = searchParams.get('total_amount');
        const purchaseOrderId = searchParams.get('purchase_order_id');
        const purchaseOrderName = searchParams.get('purchase_order_name');
        const transactionId = searchParams.get('transaction_id');

        console.log('💰 Payment callback received:', {
          pidx,
          txnId,
          amount,
          totalAmount,
          purchaseOrderId,
          purchaseOrderName,
          transactionId
        });

        if (!purchaseOrderId) {
          throw new Error('Order code not found in payment response');
        }

        setOrderCode(purchaseOrderId);

        // Prepare transaction data
        const transactionData = {
          pidx: pidx || '',
          txnId: txnId || '',
          amount: parseInt(amount || '0'),
          total_amount: parseInt(totalAmount || '0'),
          mobile: searchParams.get('mobile') || '',
          status: 'Completed',
          transaction_id: transactionId || txnId || '',
          fee: parseInt(searchParams.get('fee') || '0'),
          refunded: false
        };

        console.log('📦 Sending transaction data to backend:', {
          orderCode: purchaseOrderId,
          transactionData
        });

        // Send transaction data to backend
       const response = await axiosConfig.post(`/order/${purchaseOrderId}/verify-payment`, transactionData);

        console.log('✅ Transaction saved successfully:', response.data);

        setStatus('success');
        setMessage('Payment completed successfully! Your order has been confirmed.');

        // Optional: Redirect to orders page after delay
        setTimeout(() => {
          router.push('/order');
        }, 5000);

      } catch (error: any) {
        console.error('❌ Payment processing failed:', error);

        let errorMessage = 'Payment processing failed. Please contact support.';

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        setStatus('error');
        setMessage(errorMessage);
      }
    };

    processPayment();
  }, [searchParams, router]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {orderCode && (
              <p className="text-sm text-gray-500 mb-6">
                Order Code: <span className="font-mono font-semibold">{orderCode}</span>
              </p>
            )}
            <div className="space-y-3">
              <Link
                href="/order"
                className="block w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                View Your Orders
              </Link>
              <Link
                href="/"
                className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              You will be redirected to orders page in 5 seconds...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Try Again
              </button>
              <Link
                href="/order"
                className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Back to Orders
              </Link>
              <Link
                href="/support"
                className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Contact Support
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {getStatusContent()}
      </div>
    </div>
  );
}