import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast'; 
import { useDispatch } from 'react-redux';
import { login } from '@/context/authSlice';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const usePayment = () => {
  const { toast } = useToast(); 
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.getElementById('razorpay-script');
      if (existingScript) {
        existingScript.addEventListener(
          'load',
          () => resolve(true),
          { once: true }
        );
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Failed to load Razorpay SDK.')),
          { once: true }
        );
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
      document.body.appendChild(script);
    });
  }, []);

  const getPaymentPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/v1/payment/plans');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch payment plans';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive", duration: 5000 }); 
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createOrder = useCallback(async (planType) => {
    try {
      setError(null);
      
      const response = await api.post('/api/v1/payment/create-order', { planType });
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create order';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive", duration: 5000 }); 
      throw new Error(errorMessage);
    }
  }, [toast]);

  const verifyPayment = useCallback(async (paymentData) => {
    try {
      setError(null);
      
      const response = await api.post('/api/v1/payment/verify-payment', paymentData);
      setSuccess(true);
      toast({ title: "Payment Successful", description: "Your payment has been verified successfully." }); 
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Payment verification failed';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive", duration: 5000 }); 
      throw new Error(errorMessage);
    }
  }, [toast]);

  const handlePaymentFailure = useCallback(async (error, orderId) => {
    try {
      await api.post('/api/v1/payment/failure', { error, orderId });
      toast({ title: "Payment Failed", description: error, variant: "destructive", duration: 5000 }); 
    } catch (err) {
      console.error('Failed to log payment failure:', err);
    }
  }, [toast]);

  const getPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/v1/payment/history');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch payment history';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive", duration: 5000 }); 
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const processPayment = useCallback(async (planType, userInfo = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay SDK.');
      }

      const orderData = await createOrder(planType);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ColdmailerAi',
        description: `Payment for ${orderData.planName}`,
        image: '/white-logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: userInfo.username || orderData.username || '',
          email: userInfo.email || orderData.userEmail || '',
          contact: userInfo.phone || orderData.contact || '',
        },
        notes: {
          planType: orderData.planType,
          userId: userInfo.userId || '',
        },
        theme: {
          color: '#232326',
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled by user');
            toast({ title: "Payment Cancelled", description: "You cancelled the payment.", variant: "destructive", duration: 5000 }); 
            setLoading(false);
          },
        },
        handler: async (response) => {
          try {
            setLoading(true);
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: orderData.planType,
            };

            const verificationResult = await verifyPayment(verificationData);
            if (verificationResult?.user) {
              dispatch(login({ userData: verificationResult.user }));
            }
            setLoading(false);
            return verificationResult;
          } catch (verificationError) {
            console.error('Payment verification failed:', verificationError);
            setLoading(false);
            await handlePaymentFailure(verificationError.message, orderData.orderId);
            throw verificationError;
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', async (response) => {
        const errorMessage = response.error?.description || 'Payment failed';
        setError(errorMessage);
        toast({ title: "Payment Failed", description: errorMessage, variant: "destructive", duration: 5000 }); 
        setLoading(false);
        await handlePaymentFailure(errorMessage, orderData.orderId);
      });

      razorpay.open();
      setLoading(false);
      
    } catch (err) {
      console.error('Payment process error:', err);
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive", duration: 5000 }); 
      setLoading(false);
      throw err;
    }
  }, [toast, createOrder, verifyPayment, handlePaymentFailure, loadRazorpayScript, dispatch]);

  const resetPaymentState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    success,
    processPayment,
    getPaymentPlans,
    getPaymentHistory,
    resetPaymentState,
  };
};
