# TDG Dashboard — Bản STATIC (Vercel, không dùng serverless function)

Cùng giao diện & công thức với bản đầy đủ, nhưng **không có API route / middleware**.
Site là **static export** (`output: "export"`). Dữ liệu được lấy **một lần lúc build** rồi ghi vào
`public/data.json`; trình duyệt chỉ đọc file tĩnh đó — không có function chạy runtime, credential không hề lộ ra client.

```
Build (trên Vercel)          Runtime (trình duyệt)
─────────────────────        ─────────────────────
tsx scripts/build-data.ts     fetch ./data.json
  → query BigQuery + Sheets    → render dashboard
  → public/data.json           (không gọi BigQuery)
next build → out/ (HTML tĩnh)
```

## Chạy thử local (số liệu mẫu)
```bash
npm install
npm run dev          # predev tự sinh data.json (mock nếu chưa có credential)
```
`public/data.json` đã kèm sẵn số mẫu lấy từ file Excel nên mở lên là có ngay.

## Cấu hình dữ liệu thật
Giống bản đầy đủ — đặt biến trong **Vercel → Settings → Environment Variables** (xem `.env.example`):
`GOOGLE_CREDENTIALS`, `BQ_PROJECT_ID`, `SHEET_ID`, `SHEET_RANGE`, `REPORT_DAYS`.
Và map mã Nhanh.vn trong `lib/config.ts` (`SALE_CHANNEL_MAP`, `STATUS_SUCCESS/CANCELLED`, `NHANH_STORES`).
Service Account cần quyền BigQuery Data Viewer + Job User; Sheet share cho email SA.

`REPORT_DAYS=14` → build sinh báo cáo cho 14 ngày gần nhất (chọn ngày bằng dropdown + 1 biểu đồ xu hướng). Mỗi lần build chỉ 1 truy vấn BigQuery gộp theo ngày → rẻ.

## Deploy Vercel (không function)
```bash
git init && git add . && git commit -m "TDG Dashboard static"
gh repo create tdg-dashboard-static --private --push
npx vercel link
npx vercel env add GOOGLE_CREDENTIALS
npx vercel env add BQ_PROJECT_ID
npx vercel env add SHEET_ID
npx vercel --prod
```
Vercel tự nhận Next static export, deploy ra HTML tĩnh trong `out/`. **0 serverless function.**

## Tự cập nhật hằng ngày (vẫn không tốn function trên Vercel)
Dữ liệu cố định tại thời điểm build → muốn mới thì re-deploy. Đã kèm `.github/workflows/refresh.yml`:
1. Vercel → Project → Settings → Git → **Deploy Hooks** → tạo hook, copy URL.
2. GitHub repo → Settings → Secrets → thêm `VERCEL_DEPLOY_HOOK` = URL đó.
3. Cron chạy 08:00 VN mỗi ngày, POST tới hook → Vercel build lại → data.json mới. Cron chạy trên GitHub, Vercel chỉ build.

## Bảo vệ truy cập (vì không có middleware)
Site tĩnh không có cổng đăng nhập bằng code. Dùng một trong:
- **Vercel Deployment Protection** (Pro): Settings → Deployment Protection → Password (khuyến nghị).
- **Cloudflare Access** nếu đặt sau Cloudflare.

## Khác biệt so với bản đầy đủ
| | Bản đầy đủ (function) | Bản static (file này) |
|---|---|---|
| API route / middleware | Có | **Không** |
| Đổi khoảng ngày bất kỳ tức thời | Có (query live) | Chỉ trong tập đã build (`REPORT_DAYS`) |
| Độ mới dữ liệu | Realtime mỗi request | Tại lần build gần nhất |
| Login bằng code | Có | Dùng tính năng nền tảng |

> Sản phẩm TDG là thực phẩm bảo vệ sức khoẻ, không phải thuốc và không thay thế thuốc chữa bệnh.
