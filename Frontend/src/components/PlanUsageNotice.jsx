export function PlanUsageNotice({
  usage,
  loading,
  onUpgrade,
  className = 'w-full max-w-[350px] mx-auto px-4'
}) {
  if (loading) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300 animate-pulse">
          Checking plan usage...
        </div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const monthly = usage?.usage?.monthlyEmailGenerations;
  if (!monthly) return null;

  const limit = monthly.limit;
  const used = monthly.used ?? 0;
  const remaining = typeof limit === 'number' ? Math.max(limit - used, 0) : null;
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const nearingLimit = limit ? percent >= 80 : false;

  const resetDate = monthly.windowEnd ? new Date(monthly.windowEnd) : null;
  const resetLabel = resetDate
    ? `Resets on ${resetDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })}`
    : null;

  return (
    <div className={className}>
      <div
        className={`w-full rounded-2xl border ${
          nearingLimit ? 'border-yellow-400/70 bg-yellow-400/10' : 'border-white/10 bg-white/5'
        } p-4 text-white`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-9">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                {usage?.plan?.name || 'Current plan'}
              </p>
              {nearingLimit && onUpgrade && (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="inline-flex items-center justify-center rounded-full bg-[#6f34ed] px-3 py-1 text-sm font-medium cursor-pointer mb-1 -mt-1"
                >
                  Upgrade plan
                </button>
              )}
            </div>
            <p className="text-base font-semibold">
              {limit != null ? `${used} / ${limit} emails this month` : `${used} emails this month`}
            </p>
            {limit != null ? (
              <p className="text-xs text-gray-400">
                {remaining} remaining{resetLabel ? ` • ${resetLabel}` : ''}
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Unlimited plan benefits{resetLabel ? ` • ${resetLabel}` : ''}
              </p>
            )}
          </div>
        </div>
        {limit != null && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full ${nearingLimit ? 'bg-yellow-400' : 'bg-[#6f34ed]'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

