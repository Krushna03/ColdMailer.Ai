import { ArrowRight, History as HistoryIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HeroSection = ({
  user,
  paidPlanId,
  plansLoading,
  paymentLoading,
  historyLoading,
  onUpgrade,
  onHistory
}) => (
  <section className="text-center space-y-4">
    <Badge className="border border-white/10 bg-white/10 text-white">
      Billing & Access
    </Badge>
    <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
      Manage Your Plan
    </h1>
    <p className="text-slate-300 max-w-3xl mx-auto">
      Upgrade, verify and track every payment without leaving the app. <br /> Your workspace,
      billing, and automation limits stay in sync in real-time.
    </p>
    <div className="flex flex-wrap justify-center gap-3 pt-2">
      {!user?.isPaidUser && (
        <Button
          onClick={() => paidPlanId && onUpgrade(paidPlanId)}
          disabled={plansLoading || paymentLoading || !paidPlanId}
          className="bg-[#6f34ed] hover:bg-[#7f3dff] text-white px-6"
        >
          {(plansLoading || paymentLoading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing checkout...
            </>
          ) : (
            <>
              Upgrade plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
      <Button
        variant="outline"
        onClick={onHistory}
        disabled={historyLoading}
        className="border-white/20 bg-white/5 text-white hover:text-white hover:bg-white/10"
      >
        <HistoryIcon className="mr-2 h-4 w-4" />
        {historyLoading ? 'Syncing history...' : 'View history'}
      </Button>
    </div>
  </section>
);

export default HeroSection;

