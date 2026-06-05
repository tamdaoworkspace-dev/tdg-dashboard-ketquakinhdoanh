/**
 * scripts/build-data.ts — CHẠY LÚC BUILD (không phải serverless function).
 * Lấy số liệu N ngày gần nhất từ BigQuery + Google Sheets, tính theo công thức Excel,
 * ghi ra public/data.json để site tĩnh đọc. Refresh = re-deploy (cron GitHub Actions).
 *
 * Chạy:  tsx scripts/build-data.ts   (đã gắn vào "build" trong package.json)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { buildReport } from "../lib/report";
import { MOCK_CHANNELS, MOCK_SALARY_DAILY, MOCK_OPEX_DAILY } from "../lib/mock";
import {
  CHANNELS, NHANH_STORES, NHANH_DATE_COL, SALE_CHANNEL_MAP, resolveChannel,
  STATUS_SUCCESS, STATUS_CANCELLED, ADS_ENABLED, PLATFORM_FEE_ENABLED,
  SHEET_RANGE, ALLOCATION, type ChannelName,
} from "../lib/config";
import type { ChannelRow, Report } from "../lib/types";

const N_DAYS = Number(process.env.REPORT_DAYS || 14);
const PROJ = process.env.BQ_PROJECT_ID || "gen-lang-client-0412116320";

function ymd(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}
function lastNDates(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(ymd(d));
  }
  return out.reverse();
}
const emptyRow = (name: ChannelName): ChannelRow => ({
  name, created: { orders: 0, revenue: 0 }, cancelled: { orders: 0, revenue: 0 },
  success: { orders: 0, revenue: 0 }, cogs: 0, adsCost: 0, platformFee: 0,
});

async function fetchNhanhByDay(from: string, to: string) {
  const { BigQuery } = await import("@google-cloud/bigquery");
  const bq = new BigQuery({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
    projectId: PROJ,
  });
  const union = NHANH_STORES.map(
    (sid) => `
    SELECT
      DATE(SAFE.PARSE_TIMESTAMP('%Y-%m-%d %H:%M:%S', ${NHANH_DATE_COL})) AS d,
      '${sid}' AS store,
      sale_channel, order_status, order_id,
      SAFE_CAST(product_price AS FLOAT64) AS price,
      SAFE_CAST(product_qty AS FLOAT64) AS qty,
      SAFE_CAST(product_avg_cost AS FLOAT64) AS avg_cost
    FROM \`${PROJ}.nhanh_data.orders_${sid}\`
    WHERE SAFE.PARSE_TIMESTAMP('%Y-%m-%d %H:%M:%S', ${NHANH_DATE_COL})
          BETWEEN TIMESTAMP(@from) AND TIMESTAMP(@to)`
  ).join("\nUNION ALL\n");

  const query = `
    WITH raw AS (${union}),
    dedup AS (  -- bảng bị nhân đôi dòng (~1.94x) -> gộp dòng trùng lặp trước khi cộng
      SELECT d, store, sale_channel, order_status, order_id, price, qty, avg_cost
      FROM raw
      GROUP BY d, store, sale_channel, order_status, order_id, price, qty, avg_cost
    ),
    per_order AS (
      SELECT d, store, sale_channel, order_status, order_id,
        SUM(price*qty) AS rev, SUM(avg_cost*qty) AS cogs
      FROM dedup GROUP BY d, store, sale_channel, order_status, order_id
    )
    SELECT d, store, sale_channel, order_status,
      COUNT(*) AS orders, SUM(rev) AS revenue, SUM(cogs) AS cogs
    FROM per_order GROUP BY d, store, sale_channel, order_status`;

  const [rows] = await bq.query({
    query, params: { from: `${from} 00:00:00`, to: `${to} 23:59:59` },
  });
  return rows as any[];
}

async function fetchMonthlyCosts() {
  // Trả map { 'YYYY-MM': {salaryTotal, opexTotal} }
  const { google } = await import("googleapis");
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID!, range: SHEET_RANGE,
  });
  const map: Record<string, { salary: number; opex: number }> = {};
  for (const r of res.data.values || []) {
    const ym = String(r[0]).trim();
    if (!/^\d{4}-\d{2}$/.test(ym)) continue;
    map[ym] = {
      salary: Number(String(r[1]).replace(/[^\d.-]/g, "")) || 0,
      opex: Number(String(r[2]).replace(/[^\d.-]/g, "")) || 0,
    };
  }
  return map;
}
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
function workingDays(y: number, m: number) {
  let n = 0; const t = daysInMonth(y, m);
  for (let d = 1; d <= t; d++) { const w = new Date(y, m - 1, d).getDay(); if (w !== 0 && w !== 6) n++; }
  return n;
}

async function main() {
  const dates = lastNDates(N_DAYS);
  const from = dates[0], to = dates[dates.length - 1];
  const notes: string[] = [];
  const hasCreds = !!process.env.GOOGLE_CREDENTIALS;
  const mappingEmpty = Object.keys(SALE_CHANNEL_MAP).length === 0;
  let days: Report[] = [];

  if (!hasCreds || mappingEmpty) {
    if (!hasCreds) notes.push("Build không có GOOGLE_CREDENTIALS — dùng số liệu MẪU.");
    if (mappingEmpty) notes.push("SALE_CHANNEL_MAP trống — chưa map mã kênh Nhanh.vn.");
    days = [buildReport({
      fromDate: to, toDate: to, channels: MOCK_CHANNELS,
      salaryDaily: MOCK_SALARY_DAILY, opexDaily: MOCK_OPEX_DAILY, mock: true, notes,
    })];
  } else {
    if (!ADS_ENABLED) notes.push("Chi phí Ads chưa bật — đang để 0.");
    if (!PLATFORM_FEE_ENABLED) notes.push("Phí sàn chưa bật — đang để 0.");

    const rows = await fetchNhanhByDay(from, to);
    let costs: Record<string, { salary: number; opex: number }> = {};
    if (process.env.SHEET_ID) { try { costs = await fetchMonthlyCosts(); } catch (e: any) { notes.push("Đọc Sheet lỗi: " + e.message); } }
    else notes.push("Chưa cấu hình SHEET_ID — Lương & Vận hành để 0.");

    // Pivot theo ngày
    const byDay = new Map<string, Map<ChannelName, ChannelRow>>();
    for (const d of dates) {
      const m = new Map<ChannelName, ChannelRow>();
      CHANNELS.forEach((c) => m.set(c, emptyRow(c)));
      byDay.set(d, m);
    }
    for (const r of rows) {
      const day = typeof r.d === "string" ? r.d : r.d?.value; // BQ DATE -> {value}
      const m = byDay.get(day); if (!m) continue;
      const ch = resolveChannel(String(r.store), String(r.sale_channel)); if (!ch) continue;
      const row = m.get(ch)!;
      const orders = Number(r.orders) || 0, revenue = Number(r.revenue) || 0, cogs = Number(r.cogs) || 0;
      const st = String(r.order_status);
      row.created.orders += orders; row.created.revenue += revenue;
      if (STATUS_SUCCESS.includes(st)) { row.success.orders += orders; row.success.revenue += revenue; row.cogs += cogs; }
      else if (STATUS_CANCELLED.includes(st)) { row.cancelled.orders += orders; row.cancelled.revenue += revenue; }
    }

    days = dates.map((d) => {
      const [y, mo] = d.split("-").map(Number);
      const c = costs[d.slice(0, 7)];
      const div = ALLOCATION === "working_days" ? workingDays(y, mo) : daysInMonth(y, mo);
      const salaryDaily = c ? c.salary / div : 0;
      const opexDaily = c ? c.opex / div : 0;
      const channels = CHANNELS.map((name) => byDay.get(d)!.get(name)!);
      return buildReport({ fromDate: d, toDate: d, channels, salaryDaily, opexDaily, mock: false, notes });
    });
  }

  const out = { generatedAt: new Date().toISOString(), days };
  const dir = resolve(process.cwd(), "public");
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "data.json"), JSON.stringify(out));
  console.log(`✓ public/data.json: ${days.length} ngày (${from} → ${to})${days[0]?.meta.mock ? " [MOCK]" : ""}`);
}

main().catch((e) => { console.error("build-data lỗi:", e); process.exit(1); });
