"use client";
import type { PnLLine } from "@/lib/types";
import { fmtVNDFull, fmtPct } from "@/lib/types";

const srcBadge: Record<PnLLine["source"], { t: string; c: string }> = {
  bigquery: { t: "BigQuery", c: "text-tdg-accent bg-[#F4EDDC]" },
  sheets: { t: "Sheet", c: "text-tdg-warm bg-[#F7E6DC]" },
  formula: { t: "Công thức", c: "text-tdg-secondary bg-[#EFEADF]" },
};

export function PnLTable({ pnl }: { pnl: PnLLine[] }) {
  const net = pnl.find((p) => p.no === 3)?.value || 0; // doanh thu thuần làm mẫu số
  const highlight = new Set([3, 5, 10]);
  return (
    <div className="bg-tdg-card rounded-ios-lg border border-tdg-border shadow-ios overflow-hidden animate-fade-up">
      <div className="px-4 py-3 border-b border-tdg-border">
        <h2 className="text-[15px] font-bold text-tdg-text">Phần 2 — Kết quả hoạt động kinh doanh</h2>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-tdg-border bg-tdg-card-alt">
            <th className="px-4 py-2 text-left text-[11px] uppercase tracking-wide text-tdg-secondary font-semibold">Nội dung</th>
            <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide text-tdg-secondary font-semibold">Giá trị (VNĐ)</th>
            <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide text-tdg-secondary font-semibold">% / DTT</th>
            <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide text-tdg-secondary font-semibold">Nguồn</th>
          </tr>
        </thead>
        <tbody>
          {pnl.map((l) => {
            const b = srcBadge[l.source];
            const isProfit = l.no === 10;
            return (
              <tr key={l.no}
                  className={`border-b border-tdg-border/70 ${highlight.has(l.no) ? "bg-tdg-card-alt" : ""}`}>
                <td className={`px-4 py-2.5 text-sm ${highlight.has(l.no) ? "font-bold text-tdg-text" : "text-tdg-text"}`}>
                  {l.no}. {l.label}
                </td>
                <td className={`px-4 py-2.5 text-sm text-right tabular-nums font-semibold
                  ${isProfit ? (l.value >= 0 ? "text-tdg-positive" : "text-tdg-negative") : "text-tdg-text"}`}>
                  {fmtVNDFull(l.value)}
                </td>
                <td className="px-4 py-2.5 text-sm text-right tabular-nums text-tdg-secondary">
                  {net > 0 ? fmtPct(l.value / net) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${b.c}`}>{b.t}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
