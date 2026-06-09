// lib/types.ts — Mô hình dữ liệu báo cáo + helper format

export interface ChannelRow {
  name: string;
  created: { orders: number; revenue: number }; // Đơn tạo  (B,C)  [Nhanh]
  cancelled: { orders: number; revenue: number }; // Đơn hoàn/huỷ (E,F) [Nhanh]
  success: { orders: number; revenue: number }; // Đơn thành công (H,I) [Nhanh] - revenue = giá×SL (gross)
  cod?: number; // Tổng cod_amount đơn thành công (tiền khách thực trả, gồm VAT) [Nhanh]
  cogs: number; // Giá vốn (K) = giá nhập × SL  [Nhanh: orders×products]
  adsCost: number; // Chi phí Ads (L)  [Ads]
  platformFee: number; // Phí sàn (M)  [Sàn]
}

export interface PnLLine {
  no: number;
  label: string;
  value: number;
  source: "bigquery" | "sheets" | "formula";
}

export interface Report {
  fromDate: string;
  toDate: string;
  channels: ChannelRow[];
  pnl: PnLLine[];
  costBreakdown: { label: string; value: number }[];
  meta: {
    generatedAt: string;
    mock: boolean;
    notes: string[];
  };
}

/* ----------------------------- Format helpers ----------------------------- */
export const fmtVND = (n: number): string => {
  if (n == null || isNaN(n)) return "—";
  const a = Math.abs(n);
  const s = n < 0 ? "-" : "";
  if (a >= 1e9) return `${s}${(a / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(0)}K`;
  return n.toLocaleString("vi-VN");
};

export const fmtVNDFull = (n: number): string =>
  n == null || isNaN(n) ? "—" : `${Math.round(n).toLocaleString("vi-VN")} ₫`;

export const fmtPct = (n: number): string =>
  n == null || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`;

export const fmtInt = (n: number): string =>
  n == null || isNaN(n) ? "—" : Math.round(n).toLocaleString("vi-VN");
