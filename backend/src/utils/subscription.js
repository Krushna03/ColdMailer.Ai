const DAY_IN_MS = 24 * 60 * 60 * 1000;

const DEFAULT_BILLING_PERIOD_DAYS = Object.freeze({
  month: 30,
  week: 7,
  year: 365
});

const resolveDurationInDays = (planOrDuration) => {
  if (!planOrDuration) return null;

  if (typeof planOrDuration === 'number') {
    return planOrDuration;
  }

  if (typeof planOrDuration.durationInDays === 'number') {
    return planOrDuration.durationInDays;
  }

  if (planOrDuration.billingPeriod && DEFAULT_BILLING_PERIOD_DAYS[planOrDuration.billingPeriod]) {
    return DEFAULT_BILLING_PERIOD_DAYS[planOrDuration.billingPeriod];
  }

  return null;
};

const calculatePlanExpiry = (activationDate, planOrDuration) => {
  if (!activationDate) return null;

  const durationInDays = resolveDurationInDays(planOrDuration);
  if (!durationInDays) return null;

  return new Date(new Date(activationDate).getTime() + durationInDays * DAY_IN_MS);
};

const getRenewalReminderDate = (expiresAt, reminderDays = 2) => {
  if (!expiresAt) return null;
  return new Date(new Date(expiresAt).getTime() - reminderDays * DAY_IN_MS);
};

const isReminderDue = ({ expiresAt, reminderDays = 2, now = new Date() }) => {
  if (!expiresAt) return false;
  const reminderDate = getRenewalReminderDate(expiresAt, reminderDays);
  if (!reminderDate) return false;
  const expiryDate = new Date(expiresAt);
  return now >= reminderDate && now < expiryDate;
};

const getDaysUntilExpiry = (expiresAt, now = new Date()) => {
  if (!expiresAt) return null;
  const expiryDate = new Date(expiresAt);
  const diff = expiryDate.getTime() - now.getTime();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / DAY_IN_MS);
};

const FALLBACK_DURATION_DAYS = 30;

const enforceSubscriptionFreshness = async (userDoc) => {
  if (!userDoc || !userDoc.isPaidUser) {
    return userDoc;
  }

  let requireSave = false;

  if (!userDoc.planActivatedAt && userDoc.paymentInfo?.paymentDate) {
    userDoc.planActivatedAt = userDoc.paymentInfo.paymentDate;
    requireSave = true;
  }

  if (!userDoc.planExpiresAt && userDoc.planActivatedAt) {
    userDoc.planExpiresAt = calculatePlanExpiry(userDoc.planActivatedAt, FALLBACK_DURATION_DAYS);
    requireSave = true;
  }

  if (!userDoc.planExpiresAt && userDoc.paymentInfo?.paymentDate) {
    userDoc.planExpiresAt = calculatePlanExpiry(userDoc.paymentInfo.paymentDate, FALLBACK_DURATION_DAYS);
    requireSave = true;
  }

  if (!userDoc.planExpiresAt) {
    if (requireSave) {
      await userDoc.save();
    }
    return userDoc;
  }

  const expiryDate = new Date(userDoc.planExpiresAt);
  if (expiryDate > new Date()) {
    if (requireSave) {
      await userDoc.save();
    }
    return userDoc;
  }

  userDoc.isPaidUser = false;
  userDoc.planName = 'Free';
  userDoc.planActivatedAt = null;
  userDoc.planExpiresAt = null;

  await userDoc.save();

  return userDoc;
};

export {
  DAY_IN_MS,
  calculatePlanExpiry,
  getRenewalReminderDate,
  getDaysUntilExpiry,
  isReminderDue,
  enforceSubscriptionFreshness
};

