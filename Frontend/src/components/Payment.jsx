import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BellRing, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '../hooks/usePayment';
import { isTokenExpired, useLogout } from '../Helper/tokenValidation';
import { MovingDots } from './moving-dots';
import { Header } from './Header';
import HeroSection from './payment/HeroSection';
import Highlights from './payment/Highlights';
import PlanInsights from './payment/PlanInsights';
import WhyUpgrade from './payment/WhyUpgrade';
import PlanGrid from './payment/PlanGrid';
import HistoryModal from './payment/HistoryModal';
import { formatDate, formatDaysLabel, getDaysUntil } from './payment/utils';
import { Toaster } from './ui/toaster';
import { login } from '@/context/authSlice';

const DEFAULT_REMINDER_WINDOW_DAYS = 2;

const PaymentComponent = () => {
  const {
    loading: paymentLoading,
    error,
    success,
    processPayment,
    getPaymentPlans,
    getPaymentHistory,
    resetPaymentState,
  } = usePayment();
  const dispatch = useDispatch();

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const token = JSON.parse(localStorage.getItem('token')) || null;
  const userData = useSelector(state => state.auth.userData);
  const storedUserData = useMemo(() => {
    const stored = localStorage.getItem('data');
    return stored ? JSON.parse(stored) : null;
  }, []);
  const user = userData?.userData || userData || storedUserData?.userData || storedUserData || null;
  const syncUserPlanWithHistory = useCallback((historySnapshot) => {
    if (!historySnapshot || !user) return;

    const updatedUserSnapshot = {
      ...user,
      isPaidUser: historySnapshot.isPaidUser,
      planName: historySnapshot.currentPlan,
      planActivatedAt: historySnapshot.planActivatedAt,
      planExpiresAt: historySnapshot.planExpiresAt
    };

    dispatch(login({ userData: updatedUserSnapshot }));
  }, [dispatch, user]);
  const logoutUser = useLogout();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const planData = await getPaymentPlans();
        setPlans(planData);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, [getPaymentPlans]);

  const loadPaymentHistory = useCallback(async (shouldOpenModal = false) => {
    if (!token) {
      logoutUser('No authentication token found.');
      return;
    }

    if (isTokenExpired(token)) {
      logoutUser('Session expired. Please log in again.');
      return;
    }

    setHistoryLoading(true);
    try {
      const history = await getPaymentHistory();
      setPaymentHistory(history);
      syncUserPlanWithHistory(history);
      if (shouldOpenModal) {
        setShowHistory(true);
      }
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [token, getPaymentHistory, logoutUser, syncUserPlanWithHistory]);

  useEffect(() => {
    if (user && token && !paymentHistory) {
      loadPaymentHistory(false);
    }
  }, [user, token, paymentHistory]);

  const handleHistoryModal = () => {
    if (paymentHistory) {
      setShowHistory(true);
      return;
    }
    loadPaymentHistory(true);
  };

  const handlePayment = useCallback(async (planId) => {
    if (!token) {
      logoutUser('No authentication token found.');
      return;
    }

    if (isTokenExpired(token)) {
      logoutUser('Session expired. Please log in again.');
      return;
    }

    const selectedPlan = plans.find((plan) => plan.id === planId);

    if (!selectedPlan) {
      toast({
        title: 'Plan unavailable',
        description: 'Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedPlan.requiresPayment) {
      toast({
        title: 'No payment required',
        description: 'This plan is already included in your account.',
      });
      return;
    }

    if (user?.isPaidUser && user?.planName && user.planName !== 'Free') {
      toast({
        title: 'Plan already active',
        description: `You already have the ${user.planName} plan.`,
      });
      return;
    }

    try {
      resetPaymentState();
      await processPayment(selectedPlan.id, {
        username: user?.username,
        email: user?.email,
        userId: user?._id,
        phone: user?.phoneNumber || user?.contactNumber || ''
      });
      await loadPaymentHistory(false);
    } catch (err) {
      console.error('Payment failed:', err);
    }
  }, [
    token,
    logoutUser,
    plans,
    toast,
    user,
    resetPaymentState,
    processPayment,
    loadPaymentHistory
  ]);

  const reminderWindowDays = paymentHistory?.reminderWindowInDays || DEFAULT_REMINDER_WINDOW_DAYS;

  const paidPlanId = useMemo(() => plans.find((plan) => plan.requiresPayment)?.id, [plans]);

  const { planActivatedAt, planExpiryDate, daysUntilExpiry } = useMemo(() => {
    const activation = user?.planActivatedAt || paymentHistory?.planActivatedAt || null;
    const expiryRaw = user?.planExpiresAt || paymentHistory?.planExpiresAt || null;
    const expiryDate = expiryRaw ? new Date(expiryRaw) : null;

    let computedDays = typeof paymentHistory?.daysUntilExpiry === 'number'
      ? paymentHistory.daysUntilExpiry
      : getDaysUntil(expiryDate);

    if (Number.isNaN(computedDays)) {
      computedDays = null;
    }

    return {
      planActivatedAt: activation,
      planExpiryDate: expiryDate,
      daysUntilExpiry: typeof computedDays === 'number' ? computedDays : null
    };
  }, [paymentHistory, user]);

  const shouldShowRenewalReminder = Boolean(
    user?.isPaidUser &&
      typeof daysUntilExpiry === 'number' &&
      daysUntilExpiry > 0 &&
      daysUntilExpiry <= reminderWindowDays
  );

  const handleRenewalClick = useCallback(() => {
    if (!paidPlanId) {
      toast({
        title: 'Plan unavailable',
        description: 'Please refresh the pricing plans and try again.',
        variant: 'destructive',
      });
      return;
    }
    handlePayment(paidPlanId);
  }, [paidPlanId, handlePayment, toast]);
  
  const highlightCards = useMemo(() => {
    const membershipDate = paymentHistory?.memberSince || user?.createdAt || null;

    return [
      {
        title: 'Current Plan',
        value: user?.planName || 'Free',
        subtext: user?.isPaidUser ? 'Premium access active' : 'Free tier running',
        icon: ShieldCheck,
      },
      {
        title: 'Billing Status',
        value: user?.isPaidUser ? 'Active' : 'Trial',
        subtext: user?.isPaidUser
          ? (planActivatedAt ? `Cycle started ${formatDate(planActivatedAt)}` : 'Premium benefits unlocked')
          : 'No payments yet',
        icon: Sparkles,
      },
      {
        title: 'Member Since',
        value: formatDate(membershipDate),
        subtext: 'Thanks for growing with us',
        icon: Clock,
      },
      {
        title: 'Next Renewal',
        value: user?.isPaidUser && planExpiryDate ? formatDate(planExpiryDate) : 'Not scheduled',
        subtext: user?.isPaidUser
          ? (typeof daysUntilExpiry === 'number' && daysUntilExpiry > 0
              ? `${formatDaysLabel(daysUntilExpiry)} remaining`
              : 'Renew to stay active')
          : 'Upgrade to enable renewals',
        icon: BellRing,
      },
    ];
  }, [user, paymentHistory, planActivatedAt, planExpiryDate, daysUntilExpiry]);

  return (
    <>
    <Toaster />
    
    <div className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <MovingDots />
      <Header />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#6f34ed]/30 blur-[160px]" />
        <div className="absolute -bottom-10 -left-10 h-[20rem] w-[20rem] rounded-full bg-blue-500/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 space-y-10">
        <HeroSection  
          user={user}
          paidPlanId={paidPlanId}
          plansLoading={plansLoading}
          paymentLoading={paymentLoading}
          historyLoading={historyLoading}
          onUpgrade={handlePayment}
          onHistory={handleHistoryModal}
        />

        {shouldShowRenewalReminder && planExpiryDate && (
          <RenewalReminder
            expiresOn={planExpiryDate}
            daysLeft={daysUntilExpiry}
            onRenew={handleRenewalClick}
            disabled={!paidPlanId || paymentLoading || plansLoading}
          />
        )}

        {error && (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Highlights cards={highlightCards} />

        <section className="grid gap-6 lg:grid-cols-[1.5fr,0.5fr]">
          <PlanInsights
            user={user}
            paymentHistory={paymentHistory}
            planActivatedAt={planActivatedAt}
            planExpiresAt={planExpiryDate}
            daysUntilExpiry={daysUntilExpiry}
            reminderWindowDays={reminderWindowDays}
          />
          <WhyUpgrade />
        </section>

        <PlanGrid
          plans={plans}
          plansLoading={plansLoading}
          user={user}
          onSelectPlan={handlePayment}
        />

        {success && (
          <div className="flex justify-center">
            <Badge className="bg-green-500/20 text-green-200 border border-green-400/30">
              Payment verified!
            </Badge>
          </div>
        )}
      </div>

      <HistoryModal
        open={showHistory && Boolean(paymentHistory)}
        paymentHistory={paymentHistory}
        loading={historyLoading}
        onClose={() => setShowHistory(false)}
      />
    </div>
    </>
  );
};

const RenewalReminder = ({ expiresOn, daysLeft, onRenew, disabled }) => (
  <div className="rounded-3xl border border-amber-300/40 bg-amber-300/10 p-5 text-amber-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div className="flex items-start gap-3">
      <BellRing className="h-5 w-5 text-amber-200 mt-1.5" />
      <div>
        <p className="font-semibold">Plan expires soon</p>
        <p className="text-sm text-amber-100/80">
          Renew by {formatDate(expiresOn)} to avoid interruptions — {formatDaysLabel(daysLeft)} remaining.
        </p>
      </div>
    </div>
    <Button
      onClick={onRenew}
      disabled={disabled}
      className="bg-white text-black hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Renew plan
    </Button>
  </div>
);

export default PaymentComponent;

