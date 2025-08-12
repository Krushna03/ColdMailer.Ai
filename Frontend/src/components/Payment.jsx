import React, { useState, useEffect } from 'react';
import { usePayment } from '../hooks/usePayment';
import { isTokenExpired } from '../Helper/tokenValidation';
import { useSelector } from 'react-redux';

const PaymentComponent = ({ user }) => {
  const {
    loading,
    error,
    success,
    processPayment,
    getPaymentPlans,
    getPaymentHistory,
    resetPaymentState,
  } = usePayment();

  const [plans, setPlans] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const token = JSON.parse(localStorage.getItem('token')) || null;
  const userData = useSelector(state => state.auth.userData);

  // Fetch payment plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const planData = await getPaymentPlans();
        setPlans(planData);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      }
    };
    fetchPlans();
  }, [getPaymentPlans]);

  // Fetch payment history
  const handleViewHistory = async () => {
    try {
      const history = await getPaymentHistory();
      setPaymentHistory(history);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    }
  };

  // Handle plan selection and payment
  // const handlePayment = async (planType) => {
  //   console.log("Plan", planType);
  //   if (!token) {
  //     handleLogout("No authentication token found.");
  //     return;
  //   }

  //   if (isTokenExpired(token)) {
  //     handleLogout("Session expired. Please log in again.");
  //     return;
  //   }

  //   // try {
  //   //   resetPaymentState();
  //   //   const data = await processPayment(planType, {
  //   //     username: userData.username,
  //   //     email: userData.email,
  //   //     userId: userData._id,
  //   //   });
  //   //   console.log(data);
  //   //   alert('Payment successful! Your plan has been activated.');
  //   // } catch (err) {
  //   //   console.error('Payment failed:', err);
  //   // }
  // };

  const formatPrice = (amount) => (amount / 100).toLocaleString('en-IN');

  /** ------------------- PAYMENT HISTORY VIEW ------------------- **/
  if (showHistory && paymentHistory) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Payment History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Plans
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Current Plan</h3>
                <p className="text-lg font-bold text-blue-600">{paymentHistory.currentPlan}</p>
                <p className="text-sm text-gray-600">
                  Status: {paymentHistory.isPaidUser ? 'Active' : 'Free Plan'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Member Since</h3>
                <p className="text-lg">
                  {new Date(paymentHistory.memberSince).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {paymentHistory.paymentInfo && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Last Payment</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Payment ID:</span> {paymentHistory.paymentInfo.razorpay_payment_id}</p>
                  <p><span className="font-medium">Order ID:</span> {paymentHistory.paymentInfo.razorpay_order_id}</p>
                  <p><span className="font-medium">Date:</span> {new Date(paymentHistory.paymentInfo.paymentDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /** ------------------- PLAN SELECTION VIEW ------------------- **/
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600">Select the perfect plan for your needs</p>

        {user?.isPaidUser && (
          <div className="mt-4 flex justify-center gap-4">
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg">
              Current Plan: {user.planName}
            </div>
            <button
              onClick={handleViewHistory}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Payment History
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10A8 8 0 11.001 10 8 8 0 0118 10zM9 6h2v4H9V6zm0 6h2v2H9v-2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && <p className="text-center text-gray-500">Loading plans...</p>}

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-blue-600 mb-4">₹{formatPrice(plan.amount)}</p>
              <ul className="text-gray-600 mb-4 list-disc pl-5 space-y-1">
                {plan.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handlePayment(plan.id)}
              className="mt-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          Payment successful! Your plan is now active.
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;
