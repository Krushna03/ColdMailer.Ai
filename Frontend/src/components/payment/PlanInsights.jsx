import { Badge } from '@/components/ui/badge';
import { formatDate, formatDaysLabel } from './utils';

const PlanInsights = ({
  user,
  paymentHistory,
  planActivatedAt,
  planExpiresAt,
  daysUntilExpiry,
  reminderWindowDays
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">Plan insights</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time overview of your membership.</p>
      </div>
      <Badge className="bg-[#6f34ed]/20 text-[#c5a7ff] border border-[#6f34ed]/40">
        {user?.isPaidUser ? 'Pro access' : 'Free tier'}
      </Badge>
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <InsightCard
        label="Emails / month"
        value={user?.isPaidUser ? '500+' : '50'}
        helper="Based on your current plan"
      />
      <InsightCard
        label="Plan activated"
        value={user?.isPaidUser && planActivatedAt ? formatDate(planActivatedAt) : '--'}
        helper={user?.isPaidUser ? 'Current billing cycle' : 'Upgrade to activate'}
      />
      <InsightCard
        label="Plan expires"
        value={user?.isPaidUser && planExpiresAt ? formatDate(planExpiresAt) : '--'}
        helper={
          user?.isPaidUser
            ? (typeof daysUntilExpiry === 'number' && daysUntilExpiry > 0
                ? `${formatDaysLabel(daysUntilExpiry)} left • reminder ${reminderWindowDays || 2} days prior`
                : 'Renew now to stay active')
            : 'Renewal reminders unlock on upgrade'
        }
      />
      <InsightCard
        label="Member since"
        value={formatDate(paymentHistory?.memberSince || user?.createdAt)}
        helper="Thank you for building with us"
      />
    </div>
  </div>
);

const InsightCard = ({ label, value, helper }) => (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-2xl font-semibold mt-2">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{helper}</p>
  </div>
);

export default PlanInsights;

