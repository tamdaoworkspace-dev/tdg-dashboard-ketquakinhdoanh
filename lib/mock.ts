// lib/mock.ts — Số liệu mẫu lấy TỪ CHÍNH file Excel gốc (1 ngày), để dashboard
// render ngay khi chưa cấu hình BigQuery/Sheets. Khi cấu hình xong sẽ thay bằng data thật.
import type { ChannelRow } from "./types";

export const MOCK_CHANNELS: ChannelRow[] = [
  {
    name: "CSKH",
    created: { orders: 17, revenue: 10456267 },
    cancelled: { orders: 0, revenue: 0 },
    success: { orders: 17, revenue: 10456267 },
    cogs: 2543178,
    adsCost: 0,
    platformFee: 0,
  },
  {
    name: "MKT",
    created: { orders: 0, revenue: 0 },
    cancelled: { orders: 0, revenue: 0 },
    success: { orders: 0, revenue: 0 },
    cogs: 0,
    adsCost: 0,
    platformFee: 0,
  },
  {
    name: "Shopee",
    created: { orders: 17, revenue: 6211026 },
    cancelled: { orders: 2, revenue: 620000 },
    success: { orders: 15, revenue: 5591026 },
    cogs: 908896,
    adsCost: 2376000,
    platformFee: 1416289,
  },
  {
    name: "TikTok TDG",
    created: { orders: 154, revenue: 51825104 },
    cancelled: { orders: 8, revenue: 2850000 },
    success: { orders: 146, revenue: 48975104 },
    cogs: 10098513,
    adsCost: 22708684,
    platformFee: 11188344,
  },
  {
    name: "TikTok TDQ",
    created: { orders: 4, revenue: 952500 },
    cancelled: { orders: 0, revenue: 0 },
    success: { orders: 4, revenue: 952500 },
    cogs: 96739,
    adsCost: 0,
    platformFee: 272189,
  },
  {
    name: "Sỉ",
    created: { orders: 0, revenue: 0 },
    cancelled: { orders: 0, revenue: 0 },
    success: { orders: 0, revenue: 0 },
    cogs: 0,
    adsCost: 0,
    platformFee: 0,
  },
  {
    name: "Facebook",
    created: { orders: 0, revenue: 0 },
    cancelled: { orders: 0, revenue: 0 },
    success: { orders: 0, revenue: 0 },
    cogs: 0,
    adsCost: 36667,
    platformFee: 0,
  },
];

export const MOCK_SALARY_DAILY = 5491810; // dòng 6 file Excel
export const MOCK_OPEX_DAILY = 1500000; // dòng 7 file Excel
