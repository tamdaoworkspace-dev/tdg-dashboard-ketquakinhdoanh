"use client";
import { useEffect, useMemo, useState } from "react";
import type { Report } from "@/lib/types";
import { fmtVND, fmtInt, fmtPct } from "@/lib/types";
import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { ChannelTable } from "@/components/ChannelTable";
import { PnLTable } from "@/components/PnLTable";
import { RevenueByChannel, ProfitByChannel, CostDonut, TrendChart } from "@/components/Charts";

interface Bundle { generatedAt: string; days: Report[]; }

export default function Dashboard() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("./data.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((b: Bundle) => { setBundle(b); setIdx(b.days.length - 1); })
      .catch((e) => setErr(String(e)));
  }, []);

  const data = bundle?.days[idx] || null;

  const trend = useMemo(
    () =>
      (bundle?.days || []).map((d) => ({
        date: d.fromDate,
        revenue: d.pnl.find((p) => p.no === 3)?.value || 0,
        profit: d.pnl.find((p) => p.no === 10)?.value || 0,
      })),
    [bundle]
  );

  const pnl = (no: number) => data?.pnl.find((p) => p.no === no)?.value || 0;
  const revenue = pnl(1), netRev = pnl(3), gross = pnl(5), netProfit = pnl(10);
  const successOrders = data?.channels.reduce((a, c) => a + c.success.orders, 0) || 0;
  const grossMargin = netRev > 0 ? gross / netRev : 0;

  return (
    <div className="min-h-screen bg-tdg-bg px-4 sm:px-6 py-6 max-w-[1280px] mx-auto">
      {data && <Header fromDate={data.fromDate} toDate={data.toDate} updatedAt={bundle!.generatedAt} />}

      {/* Chọn ngày từ tập đã build sẵn (site tĩnh — không query lại) */}
      {bundle && bundle.days.length > 1 && (
        <div className="flex items-end gap-3 flex-wrap mb-5">
          <label className="text-xs text-tdg-secondary">Ngày báo cáo
            <select value={idx} onChange={(e) => setIdx(Number(e.target.value))}
              className="block mt-1 bg-tdg-card border border-tdg-border rounded-ios px-3 py-2 text-tdg-text text-sm focus:border-tdg-accent focus:outline-none">
              {bundle.days.map((d, i) => <option key={d.fromDate} value={i}>{d.fromDate}</option>)}
            </select>
          </label>
          <span className="text-[11px] text-tdg-secondary pb-2">
            Dữ liệu cố định tại thời điểm build · cập nhật bằng cách re-deploy
          </span>
        </div>
      )}

      {data?.meta.notes?.length ? (
        <div className="mb-5 rounded-ios border border-tdg-border bg-[rgba(212,130,90,0.08)] px-4 py-3">
          <div className="text-tdg-warm text-xs font-bold mb-1">
            {data.meta.mock ? "⚠ Đang hiển thị SỐ LIỆU MẪU" : "Lưu ý cấu hình"}
          </div>
          <ul className="text-tdg-secondary text-[11px] list-disc pl-4 space-y-0.5">
            {data.meta.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      ) : null}

      {err && <div className="mb-5 rounded-ios border border-tdg-negative/40 bg-[rgba(196,92,58,0.1)] px-4 py-3 text-tdg-negative text-sm">Không đọc được data.json — {err}</div>}
      {!bundle && !err && <div className="text-tdg-secondary text-sm py-10 text-center">Đang tải dữ liệu…</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <KPICard icon="💰" label="Doanh thu thuần" value={fmtVND(netRev)} sub={`DT gộp ${fmtVND(revenue)}`} />
            <KPICard icon="📈" label="Lợi nhuận tạm tính" value={fmtVND(netProfit)}
              trend={netRev > 0 ? fmtPct(netProfit / netRev) : undefined} trendUp={netProfit >= 0} sub="biên LN ròng" />
            <KPICard icon="📦" label="Đơn thành công" value={fmtInt(successOrders)} />
            <KPICard icon="🌿" label="Biên LN gộp" value={fmtPct(grossMargin)} trend={fmtVND(gross)} trendUp={gross >= 0} sub="lợi nhuận gộp" />
          </div>

          {trend.length > 1 && <div className="mb-6"><TrendChart data={trend} /></div>}

          <div className="mb-6"><ChannelTable channels={data.channels} /></div>

          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2"><RevenueByChannel channels={data.channels} /></div>
            <CostDonut data={data.costBreakdown} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <PnLTable pnl={data.pnl} />
            <ProfitByChannel channels={data.channels} />
          </div>

          <div className="text-center text-tdg-secondary text-[11px] pt-4 border-t border-tdg-border">
            TDG Dashboard (static) · Nguồn: BigQuery + Google Sheets · build {new Date(bundle!.generatedAt).toLocaleString("vi-VN")}
          </div>
        </>
      )}
    </div>
  );
}
