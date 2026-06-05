"use client";
import type { ChannelRow } from "@/lib/types";
import { fmtInt, fmtVND, fmtPct } from "@/lib/types";
import { channelProfit } from "@/lib/report";

export function ChannelTable({
  channels, activeChannel, onSelectChannel,
}: {
  channels: ChannelRow[];
  activeChannel?: string | null;
  onSelectChannel?: (name: string) => void;
}) {
  const sum = (f: (c: ChannelRow) => number) => channels.reduce((a, c) => a + (f(c) || 0), 0);
  const totCreatedRev = sum((c) => c.created.revenue);
  const totCancelRev = sum((c) => c.cancelled.revenue);
  const totSuccessRev = sum((c) => c.success.revenue);

  const T = {
    co: sum((c) => c.created.orders), cr: totCreatedRev,
    eo: sum((c) => c.cancelled.orders), fr: totCancelRev,
    ho: sum((c) => c.success.orders), ir: totSuccessRev,
    k: sum((c) => c.cogs), l: sum((c) => c.adsCost), m: sum((c) => c.platformFee),
  };
  const totProfit = sum((c) => channelProfit(c));

  const th = "px-3 py-2 text-tdg-secondary font-semibold text-[11px] uppercase tracking-wide whitespace-nowrap";
  const td = "px-3 py-2.5 text-tdg-text text-sm whitespace-nowrap";
  const num = "text-right tabular-nums";
  const share = (v: number, t: number) => (t > 0 ? fmtPct(v / t) : "-");

  return (
    <div className="bg-tdg-card rounded-ios-lg border border-tdg-border shadow-ios overflow-hidden animate-fade-up">
      <div className="px-4 py-3 border-b border-tdg-border flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-tdg-text">Phần 1 — Bán hàng theo kênh</h2>
        {onSelectChannel && (
          <span className="text-[11px] text-tdg-secondary">Bấm tên kênh để lọc cả dashboard</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-tdg-border bg-tdg-card-alt">
              <th className={`${th} text-left`} rowSpan={2}>Kênh bán</th>
              <th className={`${th} text-center border-l border-tdg-border`} colSpan={3}>Đơn tạo</th>
              <th className={`${th} text-center border-l border-tdg-border`} colSpan={3}>Đơn hoàn / huỷ</th>
              <th className={`${th} text-center border-l border-tdg-border`} colSpan={3}>Đơn thành công</th>
              <th className={`${th} ${num} border-l border-tdg-border`} rowSpan={2}>Giá vốn</th>
              <th className={`${th} ${num}`} rowSpan={2}>CP Ads</th>
              <th className={`${th} ${num}`} rowSpan={2}>Phí sàn</th>
              <th className={`${th} ${num}`} rowSpan={2}>LN kênh</th>
            </tr>
            <tr className="border-b border-tdg-border bg-tdg-card-alt">
              {["Đơn", "DT", "%", "Đơn", "DT", "%", "Đơn", "DT", "%"].map((h, i) => (
                <th key={i} className={`${th} ${num} ${i % 3 === 0 ? "border-l border-tdg-border" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => {
              const p = channelProfit(c);
              const isActive = activeChannel === c.name;
              const dim = activeChannel && !isActive;
              return (
                <tr key={c.name}
                  onClick={() => onSelectChannel?.(c.name)}
                  className={`border-b border-tdg-border/70 transition-colors
                    ${onSelectChannel ? "cursor-pointer" : ""}
                    ${isActive ? "bg-[#F4EDDC]" : "hover:bg-tdg-card-alt"}
                    ${dim ? "opacity-45" : ""}`}>
                  <td className={`${td} font-semibold`}>
                    <span className="inline-flex items-center gap-1.5">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-tdg-accent" />}
                      {c.name}
                    </span>
                  </td>
                  <td className={`${td} ${num} border-l border-tdg-border/50`}>{fmtInt(c.created.orders)}</td>
                  <td className={`${td} ${num}`}>{fmtVND(c.created.revenue)}</td>
                  <td className={`${td} ${num} text-tdg-secondary`}>{share(c.created.revenue, totCreatedRev)}</td>
                  <td className={`${td} ${num} border-l border-tdg-border/50`}>{fmtInt(c.cancelled.orders)}</td>
                  <td className={`${td} ${num}`}>{fmtVND(c.cancelled.revenue)}</td>
                  <td className={`${td} ${num} text-tdg-secondary`}>{share(c.cancelled.revenue, totCancelRev)}</td>
                  <td className={`${td} ${num} border-l border-tdg-border/50`}>{fmtInt(c.success.orders)}</td>
                  <td className={`${td} ${num} text-tdg-accent font-semibold`}>{fmtVND(c.success.revenue)}</td>
                  <td className={`${td} ${num} text-tdg-secondary`}>{share(c.success.revenue, totSuccessRev)}</td>
                  <td className={`${td} ${num} border-l border-tdg-border/50`}>{fmtVND(c.cogs)}</td>
                  <td className={`${td} ${num}`}>{fmtVND(c.adsCost)}</td>
                  <td className={`${td} ${num}`}>{fmtVND(c.platformFee)}</td>
                  <td className={`${td} ${num} font-semibold ${p >= 0 ? "text-tdg-positive" : "text-tdg-negative"}`}>{fmtVND(p)}</td>
                </tr>
              );
            })}
            <tr className="bg-tdg-card-alt font-bold">
              <td className={`${td} font-bold`}>TỔNG CỘNG</td>
              <td className={`${td} ${num} border-l border-tdg-border/50`}>{fmtInt(T.co)}</td>
              <td className={`${td} ${num}`}>{fmtVND(T.cr)}</td>
              <td className={`${td} ${num} text-tdg-secondary`}>100%</td>
              <td className={`${td} ${num} border-l border-tdg-border/50`}>{fmtInt(T.eo)}</td>
              <td className={`${td} ${num}`}>{fmtVND(T.fr)}</td>
              <td className={`${td} ${num} text-tdg-secondary`}>100%</td>
              <td className={`${td} ${num} border-l border-tdg-border/50`}>{fmtInt(T.ho)}</td>
              <td className={`${td} ${num} text-tdg-accent`}>{fmtVND(T.ir)}</td>
              <td className={`${td} ${num} text-tdg-secondary`}>{T.co > 0 ? fmtPct(T.ho / T.co) : "-"}</td>
              <td className={`${td} ${num} border-l border-tdg-border/50`}>{fmtVND(T.k)}</td>
              <td className={`${td} ${num}`}>{fmtVND(T.l)}</td>
              <td className={`${td} ${num}`}>{fmtVND(T.m)}</td>
              <td className={`${td} ${num} ${totProfit >= 0 ? "text-tdg-positive" : "text-tdg-negative"}`}>{fmtVND(totProfit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
