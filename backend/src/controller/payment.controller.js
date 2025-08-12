import crypto from 'crypto';
import { razorpayInstance } from '../index.js';
import UserModel from '../model/User.models.js';

const PAYMENT_PLANS = {
  STARTFREETRIAL: {
    name: 'Professional Plan',
    amount: 100, // in paise (₹1.00)
    currency: 'INR',
  }
};

// Create Order
const createOrder = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user?._id;

    if (!planType || !PAYMENT_PLANS[planType.toUpperCase()]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isPaidUser && user.planName !== 'Free') {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription',
      });
    }

    const plan = PAYMENT_PLANS[planType.toUpperCase()];

    const orderOptions = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: `o${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        planType: planType.toUpperCase(),
        userEmail: user.email,
        username: user.username
      }
    };

    const razorpayOrder = await razorpayInstance.orders.create(orderOptions);

    if (!razorpayOrder) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create Razorpay order',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: plan.amount,
        currency: plan.currency,
        key: process.env.RAZORPAY_KEY_ID,
        planName: plan.name,
        planType: planType.toUpperCase(),
        userEmail: user.email,
        username: user.username,
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
    });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;
    const userId = req.user?._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!planType || !PAYMENT_PLANS[planType.toUpperCase()]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type',
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    let paymentDetails;
    try {
      paymentDetails = await razorpayInstance.payments.fetch(razorpay_payment_id);
    } catch (razorpayError) {
      console.error('Razorpay fetch error:', razorpayError);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment with Razorpay',
      });
    }

    if (paymentDetails.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed successfully',
      });
    }

    let orderDetails;
    try {
      orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
    } catch (razorpayError) {
      console.error('Razorpay order fetch error:', razorpayError);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify order with Razorpay',
      });
    }

    const plan = PAYMENT_PLANS[planType.toUpperCase()];
    if (orderDetails.amount !== plan.amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch',
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          isPaidUser: true,
          planName: plan.name,
          paymentInfo: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            paymentDate: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log(`Payment successful for user ${userId}: ${razorpay_payment_id}`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          isPaidUser: updatedUser.isPaidUser,
          planName: updatedUser.planName,
          paymentDate: updatedUser.paymentInfo.paymentDate
        },
        paymentId: razorpay_payment_id,
        planName: plan.name
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
    });
  }
};

// Get Payment Plans
const getPaymentPlans = async (req, res) => {
  try {
    const plans = Object.entries(PAYMENT_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      amount: plan.amount,
      amountInRupees: plan.amount / 100,
      currency: plan.currency,
    }));

    return res.status(200).json({
      success: true,
      message: 'Payment plans retrieved successfully',
      data: plans
    });
  } catch (error) {
    console.error('Get payment plans error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment plans',
    });
  }
};

// Get Payment History
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const user = await UserModel.findById(userId)
      .select('isPaidUser planName paymentInfo createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const paymentHistory = {
      isPaidUser: user.isPaidUser,
      currentPlan: user.planName,
      paymentInfo: user.paymentInfo || null,
      memberSince: user.createdAt
    };

    return res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: paymentHistory
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history',
    });
  }
};

// Handle Payment Failure
const handlePaymentFailure = async (req, res) => {
  try {
    const { error, orderId } = req.body;
    const userId = req.user?._id;

    console.error('Payment failed:', {
      userId,
      orderId,
      error: error || 'Unknown error'
    });

    return res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
      data: { orderId }
    });

  } catch (err) {
    console.error('Handle payment failure error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to handle payment failure',
    });
  }
};

export {
  createOrder,
  verifyPayment,
  getPaymentPlans,
  getPaymentHistory,
  handlePaymentFailure
};
