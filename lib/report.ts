// lib/report.ts — Tái hiện CÔNG THỨC của file Excel (các ô màu "Công thức")
import type { ChannelRow, PnLLine, Report } from "./types";

/**
 * Tổng hợp báo cáo từ:
 *  - channels: số liệu mỗi kênh (Nhanh + Ads + Sàn)
 *  - salaryDaily / opexDaily: Lương & Vận hành đã PHÂN BỔ theo ngày (từ Google Sheet)
 *
 * Các công thức khớp với file gốc:
 *   D/G/J  = revenue kênh / tổng revenue (tỷ trọng)
 *   N      = I − K − L − M  (lợi nhuận kênh)
 *   Phần 2: DTT = DT − giảm trừ; LN gộp = DTT − giá vốn; LN tạm tính = gộp −6−7−8−9
 */
export function buildReport(args: {
  fromDate: string;
  toDate: string;
  channels: ChannelRow[];
  salaryDaily: number;
  opexDaily: number;
  mock: boolean;
  notes?: string[];
}): Report {
  const { fromDate, toDate, channels, salaryDaily, opexDaily, mock } = args;

  // ----- Tổng cộng hàng 14 -----
  const sum = (f: (c: ChannelRow) => number) =>
    channels.reduce((a, c) => a + (f(c) || 0), 0);

  const T = {
    createdOrders: sum((c) => c.created.orders), // B14
    createdRevenue: sum((c) => c.created.revenue), // C14
    cancelOrders: sum((c) => c.cancelled.orders), // E14
    cancelRevenue: sum((c) => c.cancelled.revenue), // F14
    successOrders: sum((c) => c.success.orders), // H14
    successRevenue: sum((c) => c.success.revenue), // I14
    cogs: sum((c) => c.cogs), // K14
    ads: sum((c) => c.adsCost), // L14
    fee: sum((c) => c.platformFee), // M14
  };

  // ----- Phần 2: KQHĐKD -----
  const revenue = T.successRevenue; // 1. Doanh thu bán hàng = I14
  const deductions = T.cancelRevenue; // 2. Giảm trừ = F14
  const netRevenue = revenue - deductions; // 3. DTT
  const cogs = T.cogs; // 4. Giá vốn = K14
  const grossProfit = netRevenue - cogs; // 5. LN gộp
  const salary = salaryDaily; // 6. Lương (Sheet)
  const opex = opexDaily; // 7. Vận hành (Sheet)
  const ads = T.ads; // 8. Quảng cáo = L14
  const fee = T.fee; // 9. Phí sàn = M14
  const netProfit = grossProfit - salary - opex - ads - fee; // 10. LN tạm tính

  const pnl: PnLLine[] = [
    { no: 1, label: "Doanh thu bán hàng", value: revenue, source: "bigquery" },
    { no: 2, label: "Các khoản giảm trừ doanh thu", value: deductions, source: "bigquery" },
    { no: 3, label: "Doanh thu thuần (3 = 1 − 2)", value: netRevenue, source: "formula" },
    { no: 4, label: "Giá vốn hàng bán", value: cogs, source: "bigquery" },
    { no: 5, label: "Lợi nhuận gộp (5 = 3 − 4)", value: grossProfit, source: "formula" },
    { no: 6, label: "Lương tạm tính", value: salary, source: "sheets" },
    { no: 7, label: "Chi phí vận hành tạm tính", value: opex, source: "sheets" },
    { no: 8, label: "Chi phí quảng cáo", value: ads, source: "bigquery" },
    { no: 9, label: "Phí sàn TMĐT", value: fee, source: "bigquery" },
    { no: 10, label: "Lợi nhuận tạm tính (10 = 5−6−7−8−9)", value: netProfit, source: "formula" },
  ];

  const costBreakdown = [
    { label: "Giá vốn", value: cogs },
    { label: "Lương", value: salary },
    { label: "Vận hành", value: opex },
    { label: "Quảng cáo", value: ads },
    { label: "Phí sàn", value: fee },
  ];

  return {
    fromDate,
    toDate,
    channels,
    pnl,
    costBreakdown,
    meta: { generatedAt: new Date().toISOString(), mock, notes: args.notes || [] },
  };
}

/** Tỷ trọng doanh thu thành công của 1 kênh (cột J). */
export const successShare = (c: ChannelRow, totalSuccessRev: number) =>
  totalSuccessRev > 0 ? c.success.revenue / totalSuccessRev : 0;

/** Lợi nhuận kênh (cột N). */
export const channelProfit = (c: ChannelRow) =>
  c.success.revenue - c.cogs - c.adsCost - c.platformFee;
