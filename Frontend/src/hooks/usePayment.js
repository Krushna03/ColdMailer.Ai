// hooks/usePayment.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast'; // ✅ Import toast hook

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api/v1';

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const usePayment = () => {
  const { toast } = useToast(); // ✅ Initialize toast
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      const existingScript = document.getElementById('razorpay-script');
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Get payment plans
  const getPaymentPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/v1/payment/plans');
      toast({ title: "Plans Loaded", description: "Available payment plans fetched successfully." }); // ✅ Toast success
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch payment plans';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive", duration: 5000 }); // ✅ Toast error
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create order
  const createOrder = useCallback(async (planType) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/v1/payment/create-order', { planType });
      toast({ title: "Order Created", description: `Order for ${planType} plan created successfully.` }); // ✅ Toast success
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create order';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive", duration: 5000 }); // ✅ Toast error
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Verify payment
  const verifyPayment = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/v1/payment/verify-payment', paymentData);
      setSuccess(true);
      toast({ title: "Payment Successful", description: "Your payment has been verified successfully." }); // ✅ Toast success
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Payment verification failed';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive", duration: 5000 }); // ✅ Toast error
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle payment failure
  const handlePaymentFailure = useCallback(async (error, orderId) => {
    try {
      await api.post('/api/v1/payment/failure', { error, orderId });
      toast({ title: "Payment Failed", description: error, variant: "destructive", duration: 5000 }); // ✅ Toast error
    } catch (err) {
      console.error('Failed to log payment failure:', err);
    }
  }, [toast]);

  // Get payment history
  const getPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/v1/payment/history');
      toast({ title: "History Loaded", description: "Payment history fetched successfully." }); // ✅ Toast success
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch payment history';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive", duration: 5000 }); // ✅ Toast error
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Main payment processing function
  const processPayment = useCallback(async (planType, userInfo = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({ title: "Error", description: "Failed to load Razorpay SDK.", variant: "destructive", duration: 5000 });
      }

      // Create order
      const orderData = await createOrder(planType);

      // Configure Razorpay options
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
            toast({ title: "Payment Cancelled", description: "You cancelled the payment.", variant: "destructive", duration: 5000 }); // ✅ Toast cancel
            setLoading(false);
          },
        },
        handler: async (response) => {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: orderData.planType,
            };

            const verificationResult = await verifyPayment(verificationData);
            return verificationResult;
          } catch (verificationError) {
            console.error('Payment verification failed:', verificationError);
            await handlePaymentFailure(verificationError.message, orderData.orderId);
            throw verificationError;
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', async (response) => {
        const errorMessage = response.error?.description || 'Payment failed';
        setError(errorMessage);
        toast({ title: "Payment Failed", description: errorMessage, variant: "destructive", duration: 5000 }); // ✅ Toast fail
        await handlePaymentFailure(errorMessage, orderData.orderId);
      });

      razorpay.open();
      
    } catch (err) {
      console.error('Payment process error:', err);
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive", duration: 5000 }); // ✅ Toast error
      setLoading(false);
      throw err;
    }
  }, [toast, createOrder, verifyPayment, handlePaymentFailure, loadRazorpayScript]);

  // Reset state
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
