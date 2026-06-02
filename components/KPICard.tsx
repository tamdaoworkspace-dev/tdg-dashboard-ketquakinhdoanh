interface Props {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  trend?: string; trendUp?: boolean;
}
export function KPICard({ icon, label, value, sub, trend, trendUp }: Props) {
  return (
    <div className="bg-tdg-card rounded-ios p-4 border border-tdg-border shadow-ios animate-fade-up
                    hover:-translate-y-0.5 hover:shadow-ios-lg transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-7 h-7 rounded-lg bg-[#F4EDDC] text-tdg-accent flex items-center justify-center">{icon}</span>
        <span className="text-xs text-tdg-secondary font-medium">{label}</span>
      </div>
      <div className="text-[22px] font-bold text-tdg-text tracking-tight leading-none">{value}</div>
      <div className="flex items-center gap-2 mt-2 min-h-[20px]">
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
            trendUp ? "text-tdg-positive bg-[#EBF3E2]" : "text-tdg-negative bg-[#F7E6E0]"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
        {sub && <span className="text-[11px] text-tdg-secondary">{sub}</span>}
      </div>
    </div>
  );
}

/* Icon SVG đơn giản (theo skill: không dùng emoji làm icon hệ thống) */
const ic = "w-4 h-4";
export const IconRevenue = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
export const IconProfit = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8M21 7v6h-6"/></svg>);
export const IconOrders = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>);
export const IconMargin = () => (<svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>);
