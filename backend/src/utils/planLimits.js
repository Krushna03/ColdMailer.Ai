import { PAYMENT_PLANS, DEFAULT_PLAN_ID } from '../config/paymentPlans.js';
import { Email } from '../model/Email.model.js';

const getPlanConfigById = (planId = DEFAULT_PLAN_ID) => {
  if (!planId) {
    return PAYMENT_PLANS[DEFAULT_PLAN_ID];
  }
  return PAYMENT_PLANS[planId] || PAYMENT_PLANS[DEFAULT_PLAN_ID];
};

const getPlanConfigForUser = (userDoc = {}) => {
  if (!userDoc) {
    return PAYMENT_PLANS[DEFAULT_PLAN_ID];
  }
  return getPlanConfigById(userDoc.planId);
};

const getMonthlyUsageWindow = (now = new Date()) => {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

const getMonthlyEmailUsage = async ({ userId, now = new Date() }) => {
  const { start, end } = getMonthlyUsageWindow(now);
  const used = await Email.countDocuments({
    userId,
    createdAt: { $gte: start, $lt: end }
  });

  return {
    used,
    windowStart: start,
    windowEnd: end
  };
};

const buildPlanUsageSummary = async ({
  user,
  planConfig,
  now = new Date(),
  monthlyUsageSnapshot = null
}) => {
  const usage =
    monthlyUsageSnapshot ||
    (await getMonthlyEmailUsage({ userId: user._id, now }));

  return {
    plan: {
      id: planConfig.id,
      name: planConfig.name,
      requiresPayment: planConfig.requiresPayment,
      description: planConfig.description
    },
    usage: {
      monthlyEmailGenerations: {
        ...usage,
        limit: planConfig?.limits?.monthlyEmailGenerations ?? null
      }
    },
    capabilities: {
      maxRegenerationsPerEmail:
        planConfig?.limits?.maxRegenerationsPerEmail ?? null
    }
  };
};

export {
  getPlanConfigById,
  getPlanConfigForUser,
  getMonthlyUsageWindow,
  getMonthlyEmailUsage,
  buildPlanUsageSummary
};



