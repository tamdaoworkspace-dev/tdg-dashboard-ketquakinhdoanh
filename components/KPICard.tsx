interface Props {
  icon: string; label: string; value: string; sub?: string;
  trend?: string; trendUp?: boolean;
}
export function KPICard({ icon, label, value, sub, trend, trendUp }: Props) {
  return (
    <div className="bg-tdg-card rounded-ios p-4 border border-tdg-border animate-fade-up
                    hover:-translate-y-0.5 transition-transform shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-tdg-secondary font-medium">{label}</span>
      </div>
      <div className="text-[22px] font-bold text-tdg-text tracking-tight leading-none">{value}</div>
      <div className="flex items-center gap-2 mt-1.5 min-h-[20px]">
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
            trendUp ? "text-tdg-positive bg-[rgba(93,138,60,0.12)]"
                    : "text-tdg-negative bg-[rgba(196,92,58,0.12)]"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
        {sub && <span className="text-[11px] text-tdg-secondary">{sub}</span>}
      </div>
    </div>
  );
}
