import { Clock, ShieldCheck, Sparkles } from 'lucide-react';

const WhyUpgrade = () => (
  <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-xl">
    <h3 className="text-lg font-semibold mb-2">Why teams upgrade</h3>
    <p className="text-sm text-slate-300">
      Unlock unlimited revisions, advanced personalization and priority support with the Professional plan.
    </p>
    <ul className="mt-6 space-y-4 text-sm text-slate-300">
      <li className="flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-[#6f34ed] mt-1" />
        AI models tuned for multi-channel outreach.
      </li>
      <li className="flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-[#6f34ed] mt-1" />
        Keep tone, context and CRM fields perfectly synced.
      </li>
      <li className="flex items-start gap-3">
        <Clock className="h-4 w-4 text-[#6f34ed] mt-1" />
        Priority response from success engineers.
      </li>
    </ul>
  </div>
);

export default WhyUpgrade;

