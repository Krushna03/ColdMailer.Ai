const DEFAULT_PLAN_ID = 'GETSTARTED';

const PAYMENT_PLANS = Object.freeze({
  GETSTARTED: {
    id: 'GETSTARTED',
    name: 'Starter Plan',
    amount: 0,
    currency: 'INR',
    description: 'Perfect for trying AI-powered email generation',
    features: [
      '50 emails per month',
      'Basic email templates',
      'Standard tone options',
      'Copy & export functionality'
    ],
    billingPeriod: 'forever',
    durationInDays: null,
    requiresPayment: false,
    buttonText: 'Get Started',
    popular: false,
    limits: Object.freeze({
      monthlyEmailGenerations: 50,
      maxRegenerationsPerEmail: 3
    })
  },
  STARTFREETRIAL: {
    id: 'STARTFREETRIAL',
    name: 'Professional Plan',
    amount: 900, // ₹9 converted to paise
    currency: 'INR',
    description: 'Ideal for professionals and small teams',
    features: [
      '500 emails per month',
      'Advanced personalization',
      'All tone customizations',
      'Priority email support',
      'Unlimited revisions'
    ],
    billingPeriod: 'month',
    durationInDays: 30,
    requiresPayment: true,
    buttonText: 'Start Free Trial',
    popular: true,
    limits: Object.freeze({
      monthlyEmailGenerations: 500,
      maxRegenerationsPerEmail: null
    })
  }
});

const normalizePlanType = (planType = '') => planType.trim().toUpperCase();

const getPlanByType = (planType = '') => {
  if (!planType) return null;
  return PAYMENT_PLANS[normalizePlanType(planType)] || null;
};

const PAYABLE_PLAN_IDS = Object.freeze(
  Object.keys(PAYMENT_PLANS).filter(
    (planType) => PAYMENT_PLANS[planType].requiresPayment
  )
);

export {
  PAYMENT_PLANS,
  PAYABLE_PLAN_IDS,
  DEFAULT_PLAN_ID,
  getPlanByType,
  normalizePlanType
};

