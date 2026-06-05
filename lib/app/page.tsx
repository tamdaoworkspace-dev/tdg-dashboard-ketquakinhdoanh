"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import type { Report } from "@/lib/types";
import { fmtVND, fmtInt, fmtPct } from "@/lib/types";
import { aggregateReports } from "@/lib/report";
import { Header } from "@/components/Header";
import { KPICard, IconRevenue, IconProfit, IconOrders, IconMargin } from "@/components/KPICard";
import { ChannelTable } from "@/components/ChannelTable";
import { PnLTable } from "@/components/PnLTable";
import { RevenueByChannel, ProfitByChannel, CostDonut, RevenueShareDonut, TrendChart } from "@/components/Charts";

interface Bundle { generatedAt: string; days: Report[]; }

export default function Dashboard() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [channel, setChannel] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`./data.json?t=${Date.now()}`, { cache: "no-store" });
      const b: Bundle = await res.json();
      setBundle(b);
      if (b.days.length) {
        setFrom((f) => f || b.days[0].fromDate);
        setTo((t) => t || b.days[b.days.length - 1].fromDate);
      }
    } catch (e: any) { setErr(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const allDates = useMemo(() => (bundle?.days || []).map((d) => d.fromDate), [bundle]);
  const minDate = allDates[0] || "";
  const maxDate = allDates[allDates.length - 1] || "";

  // báo cáo tổng hợp theo khoảng ngày + cross-filter kênh
  const data = useMemo(() => {
    if (!bundle || !from || !to) return null;
    return aggregateReports(bundle.days, from, to, channel);
  }, [bundle, from, to, channel]);

  // đường xu hướng theo từng ngày trong khoảng đã chọn
  const trend = useMemo(() => {
    if (!bundle) return [];
    return bundle.days
      .filter((d) => d.fromDate >= from && d.fromDate <= to)
      .map((d) => ({
        date: d.fromDate,
        revenue: d.pnl.find((p) => p.no === 3)?.value || 0,
        profit: d.pnl.find((p) => p.no === 10)?.value || 0,
      }));
  }, [bundle, from, to]);

  const toggleChannel = (name: string) => setChannel((c) => (c === name ? null : name));

  const pnl = (no: number) => data?.pnl.find((p) => p.no === no)?.value || 0;
  const revenue = pnl(1), netRev = pnl(3), gross = pnl(5), netProfit = pnl(10);
  const successOrders = data?.channels.reduce((a, c) => a + c.success.orders, 0) || 0;
  const grossMargin = netRev > 0 ? gross / netRev : 0;

  const inputCls = "bg-tdg-card border border-tdg-border rounded-ios px-3 py-2 text-tdg-text text-sm focus:border-tdg-accent focus:outline-none";

  return (
    <div className="min-h-screen bg-tdg-bg px-4 sm:px-6 py-6 max-w-[1280px] mx-auto">
      {data && <Header fromDate={data.fromDate} toDate={data.toDate} updatedAt={bundle!.generatedAt} />}

      {/* Thanh điều khiển: lọc ngày + refresh */}
      {bundle && (
        <div className="flex items-end gap-3 flex-wrap mb-5">
          <label className="text-xs text-tdg-secondary">Từ ngày
            <input type="date" value={from} min={minDate} max={maxDate}
              onChange={(e) => setFrom(e.target.value)} className={`block mt-1 ${inputCls}`} />
          </label>
          <label className="text-xs text-tdg-secondary">Đến ngày
            <input type="date" value={to} min={minDate} max={maxDate}
              onChange={(e) => setTo(e.target.value)} className={`block mt-1 ${inputCls}`} />
          </label>
          <button onClick={() => { setFrom(minDate); setTo(maxDate); setChannel(null); }}
            className="text-sm font-medium px-3 py-2 rounded-ios border border-tdg-border text-tdg-secondary hover:bg-tdg-card-alt transition-colors">
            Toàn kỳ
          </button>
          <button onClick={loadData}
            className="bg-tdg-accent text-white text-sm font-semibold px-4 py-2 rounded-ios hover:bg-tdg-accent-dark transition-colors inline-flex items-center gap-2">
            <svg className={`w-4 h-4 ${loading ? "spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            Làm mới
          </button>
        </div>
      )}

      {/* Chip cross-filter đang áp dụng */}
      {channel && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-tdg-secondary">Đang lọc kênh:</span>
          <button onClick={() => setChannel(null)}
            className="inline-flex items-center gap-1.5 bg-[#F4EDDC] text-tdg-accent-dark text-xs font-semibold px-3 py-1 rounded-pill border border-tdg-border">
            {channel}
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {data?.meta.notes?.length ? (
        <div className="mb-5 rounded-ios border border-tdg-border bg-[#FBF3E9] px-4 py-3">
          <div className="text-tdg-warm text-xs font-bold mb-1">
            {data.meta.mock ? "Đang hiển thị SỐ LIỆU MẪU (chưa cấu hình build)" : "Lưu ý cấu hình"}
          </div>
          <ul className="text-tdg-secondary text-[11px] list-disc pl-4 space-y-0.5">
            {data.meta.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      ) : null}

      {err && <div className="mb-5 rounded-ios border border-tdg-negative/40 bg-[#F7E6E0] px-4 py-3 text-tdg-negative text-sm">Không đọc được data.json — {err}</div>}
      {loading && !bundle && <div className="text-tdg-secondary text-sm py-10 text-center">Đang tải dữ liệu…</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <KPICard icon={<IconRevenue />} label="Doanh thu thuần" value={fmtVND(netRev)} sub={`DT gộp ${fmtVND(revenue)}`} />
            <KPICard icon={<IconProfit />} label="Lợi nhuận tạm tính" value={fmtVND(netProfit)}
              trend={netRev > 0 ? fmtPct(netProfit / netRev) : undefined} trendUp={netProfit >= 0} sub="biên LN ròng" />
            <KPICard icon={<IconOrders />} label="Đơn thành công" value={fmtInt(successOrders)} />
            <KPICard icon={<IconMargin />} label="Biên LN gộp" value={fmtPct(grossMargin)} trend={fmtVND(gross)} trendUp={gross >= 0} sub="lợi nhuận gộp" />
          </div>

          {trend.length > 1 && <div className="mb-6"><TrendChart data={trend} /></div>}

          <div className="mb-6">
            <ChannelTable channels={data.channels} activeChannel={channel} onSelectChannel={toggleChannel} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <RevenueByChannel channels={data.channels} activeChannel={channel} onSelectChannel={toggleChannel} />
            <CostDonut data={data.costBreakdown} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <ProfitByChannel channels={data.channels} activeChannel={channel} onSelectChannel={toggleChannel} />
            <RevenueShareDonut channels={data.channels} />
          </div>

          <div className="mb-6"><PnLTable pnl={data.pnl} /></div>

          <div className="text-center text-tdg-secondary text-[11px] pt-4 border-t border-tdg-border">
            TDG Dashboard · Nguồn: BigQuery + Google Sheets · build {new Date(bundle!.generatedAt).toLocaleString("vi-VN")} · {data.meta.mock ? "chế độ mẫu" : "dữ liệu thật"}
          </div>
        </>
      )}
    </div>
  );
}
