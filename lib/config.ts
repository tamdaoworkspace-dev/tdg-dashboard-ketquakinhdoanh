/**
 * ============================================================================
 *  TDG DASHBOARD — CẤU HÌNH MAPPING (NƠI DUY NHẤT CẦN CHỈNH)
 * ============================================================================
 *  File Excel gốc "BÁO CÁO KẾT QUẢ HÀNG NGÀY" dùng MÀU để đánh dấu nguồn dữ liệu:
 *    • Màu "Nhanh.vn"   -> số đơn / doanh thu / giá vốn  -> BigQuery: nhanh_data
 *    • Màu "báo cáo Ads"-> chi phí quảng cáo             -> BigQuery: *_ads_dwh
 *    • Màu "Sàn"        -> phí sàn TMĐT                  -> BigQuery: shopee/tiktok shop
 *    • Màu "Công thức"  -> ô tính toán                   -> tính trong app (lib/report.ts)
 *    • Màu "Nhập đầu tháng, phân bổ theo ngày" -> Lương + Vận hành -> Google Sheets
 *
 *  Toàn bộ các "ô cùng màu" được gom về đây để bạn map 1 lần.
 * ============================================================================
 */

/** 7 kênh bán trong báo cáo (Phần 1), đúng thứ tự hàng 7–13 của file Excel. */
export const CHANNELS = [
  "CSKH",
  "MKT",
  "Shopee",
  "TikTok TDG",
  "TikTok TDQ",
  "Sỉ",
  "Facebook",
] as const;
export type ChannelName = (typeof CHANNELS)[number];

/**
 * ---------------------------------------------------------------------------
 *  NHANH.VN — Store nào dùng để báo cáo
 *  Bảng: nhanh_data.orders_<businessId>
 *    144344  = store CHÍNH (≈324K đơn, 2023→nay)
 *    219805  = store phụ   (≈1.1K đơn)
 *  ⚠️ XÁC NHẬN: dùng 1 store hay cộng cả 2.
 * ---------------------------------------------------------------------------
 */
export const NHANH_STORES = ["144344", "219805"]; // cộng cả 2 store

/**
 *  Store (businessId) -> thương hiệu, dùng để tách "TikTok TDG" vs "TikTok TDQ".
 *  ⚠️ Theo xác nhận của user: 219805 = TDG, 144344 = TDQ.
 *  (Nếu phát hiện gán ngược thì chỉ cần đổi 2 dòng dưới đây.)
 */
export const STORE_BRAND: Record<string, "TDG" | "TDQ"> = {
  "219805": "TDG",
  "144344": "TDQ",
};

/**
 * ---------------------------------------------------------------------------
 *  NHANH.VN — Mã sale_channel (STRING số) -> tên kênh báo cáo
 *  Bảng chính thức (apidocs.nhanh.vn/v3/modelconstant > Order Sale Channel):
 *    1=Admin  2=Website  10=API  20=Facebook  21=Instagram  41=Lazada
 *    42=Shopee  43=Sendo  45=Tiki  48=Tiktok Shop  49=Zalo OA ...
 *  Trong data TDG chỉ xuất hiện 5 mã: 1, 10, 20, 42, 48.
 *
 *  ⚠️ LƯU Ý cấu trúc: báo cáo có 7 kênh nhưng sale_channel chỉ phân biệt được 5.
 *     - "TikTok TDG" vs "TikTok TDQ": cùng mã 48, KHÁC NHAU ở STORE
 *       (TDG = store 144344, TDQ = store 219805 — CẦN XÁC NHẬN).
 *       Hiện gộp toàn bộ 48 vào "TikTok TDG"; muốn tách TDQ cần map theo store.
 *     - "Sỉ": chưa có nguồn rõ (có thể theo order_type=bán sỉ) — CHƯA map.
 * ---------------------------------------------------------------------------
 */
export const SALE_CHANNEL_MAP: Record<string, ChannelName> = {
  "42": "Shopee",      // chính thức = Shopee
  "20": "Facebook",    // chính thức = Facebook
  "1": "CSKH",         // Admin = đơn tạo tay (NV CSKH) — CẦN XÁC NHẬN
  "10": "MKT",         // API = đơn đẩy qua API/website — CẦN XÁC NHẬN
  // "48" (Tiktok Shop) KHÔNG để ở đây — tách theo store trong resolveChannel().
  // "Sỉ": chưa map (có thể theo order_type=bán sỉ).
};

/**
 * Quy đổi (store, sale_channel) -> kênh báo cáo.
 * - Tiktok Shop (48) tách theo store: 219805=TDG, 144344=TDQ.
 * - Các kênh khác lấy theo SALE_CHANNEL_MAP.
 * Trả null nếu không map được (đơn sẽ không tính vào kênh nào).
 */
export function resolveChannel(store: string, saleChannel: string): ChannelName | null {
  if (saleChannel === "48") {
    const brand = STORE_BRAND[store];
    if (brand === "TDG") return "TikTok TDG";
    if (brand === "TDQ") return "TikTok TDQ";
    return "TikTok TDG"; // store lạ -> gộp tạm vào TDG
  }
  return SALE_CHANNEL_MAP[saleChannel] ?? null;
}

/**
 * ---------------------------------------------------------------------------
 *  NHANH.VN — Mã order_status (STRING số) -> nhóm đơn trong báo cáo
 *  Giá trị thực: "60"(323K) "63"(48K) "72"(14K) "64" "59" "57" "54" ...
 *  Báo cáo cần 3 nhóm: created (đơn tạo) | cancelled (hoàn/huỷ) | success (thành công)
 *  Quy ước: "created" = TẤT CẢ đơn được tạo trong ngày (mọi status).
 *           "success" = đơn đã giao thành công.
 *           "cancelled" = đơn huỷ / hoàn.
 *  ⚠️ TODO XÁC NHẬN mã nào = thành công, mã nào = huỷ/hoàn.
 *     (60 là status áp đảo -> nhiều khả năng "Đã giao/Thành công".)
 * ---------------------------------------------------------------------------
 */
// Theo tài liệu Nhanh.vn API v3.0 (đối soát nội bộ TDG):
//   Thành công = 60
//   Hoàn       = 71 (đang hoàn), 72 (đã hoàn), 74 (xác nhận hoàn)
//   Huỷ        = 58 (NVC huỷ), 63 (khách huỷ), 64 (hệ thống huỷ)
//   Tổng đơn (tạm tính) = 54,55,56,57,42,40,43,59,68,73 (+ các nhóm trên)
export const STATUS_SUCCESS = ["60"];
export const STATUS_CANCELLED = ["71", "72", "74", "58", "63", "64"]; // hoàn + huỷ
// "created" = mọi đơn, không cần khai báo.

/**
 * ---------------------------------------------------------------------------
 *  NHANH.VN — Tên cột tiền/ngày (tất cả cột là STRING -> phải SAFE_CAST)
 *  Doanh thu mỗi đơn = SUM(product_price * product_qty) trừ discount  (grain = line item)
 *  Giá vốn (COGS)    = SUM(product_avg_cost * product_qty)
 *  Mốc thời gian lọc theo ngày: created_at (đơn tạo) / success_at (đơn thành công).
 *  ⚠️ KIỂM CHỨNG THỰC TẾ (BigQuery): success_at RỖNG 100% -> KHÔNG lọc theo
 *     "ngày thành công" được (dù Nhanh khuyến nghị) -> dùng created_at cho cả 3 nhóm.
 *  ⚠️ Bảng orders_* bị NHÂN ĐÔI dòng (~1.94x) -> query phải DEDUPE trước khi cộng,
 *     nếu không doanh thu & giá vốn sẽ bị gấp đôi (đã xử lý trong scripts/build-data.ts).
 * ---------------------------------------------------------------------------
 */
export const NHANH_DATE_COL = "created_at"; // dùng để lọc theo ngày báo cáo

/**
 * ---------------------------------------------------------------------------
 *  CHI PHÍ ADS (màu "báo cáo Ads") -> tổng vào dòng "8. Chi phí quảng cáo"
 *  Nguồn ĐÃ XÁC NHẬN (đọc trong scripts/build-data.ts > fetchAdsByDay):
 *    Facebook : facebook_ads_dwh.facebook_ads_ads_insights   (spend, date_start)  -> kênh Facebook
 *    Shopee   : shopee_ads_dwh.shopee_cpc_ads_daily_performance_tam_dao_quan_tdg (expense, date) -> Shopee
 *    TikTok   : tiktok_ads_dwh.tiktok_ads_gmv_max_campaign_overview_report (cost, stat_time_day)
 *               tách theo account_name: '%tdg%' -> TikTok TDG ; '%tam dao quan%/%tdq%' -> TikTok TDQ
 *  ⚠️ TikTok hiện chỉ gồm chiến dịch GMV Max của tài khoản "Tiktok TDG VN".
 *     Nếu có thêm tài khoản TDQ / quảng cáo thường (bảng tiktok_ads_<hash>) thì bổ sung sau.
 * ---------------------------------------------------------------------------
 */
export const ADS_ENABLED = true;

/**
 * ---------------------------------------------------------------------------
 *  PHÍ SÀN (màu "Sàn") -> tổng vào dòng "9. Phí sàn TMĐT"
 *  Cách dùng: ĐIỀN % CỐ ĐỊNH cho từng sàn ở PLATFORM_FEE_PCT bên dưới.
 *  Phí sàn mỗi kênh = % × DT thuần (cod) của kênh đó trong ngày.
 *  (Sau này nếu có bảng đối soát Shopee/TikTok thật thì thay bằng số thực.)
 * ---------------------------------------------------------------------------
 */
export const PLATFORM_FEE_ENABLED = true;

/**
 *  % phí sàn cố định theo kênh — SỬA SỐ NÀY CHO ĐÚNG VỚI SHOP CỦA BẠN.
 *  Ví dụ 0.10 = 10%. Kênh không khai = 0 (không tính phí).
 */
export const PLATFORM_FEE_PCT: Partial<Record<ChannelName, number>> = {
  "Shopee": 0.10,       // ← ĐIỀN % phí Shopee thật
  "TikTok TDG": 0.05,   // ← ĐIỀN % phí TikTok thật
  "TikTok TDQ": 0.05,   // ← ĐIỀN % phí TikTok thật
};

/**
 * ---------------------------------------------------------------------------
 *  GOOGLE SHEETS (màu "Nhập đầu tháng, phân bổ theo ngày")
 *  -> dòng "6. Lương tạm tính" và "7. Chi phí vận hành tạm tính"
 *  Bạn nhập TỔNG THÁNG vào 1 Google Sheet, app chia theo ngày.
 *
 *  Cấu trúc Sheet kỳ vọng (1 hàng / tháng), header ở hàng 1:
 *    | month (YYYY-MM) | salary_total | opex_total |
 *    | 2026-06         | 165000000    | 45000000   |
 *
 *  ⚠️ TODO: gửi link Sheet + tab + range. Phân bổ ngày mặc định:
 *    daily = total / (số ngày trong tháng).  (đổi sang "ngày làm việc" nếu cần)
 * ---------------------------------------------------------------------------
 */
export const SHEET_TAB = process.env.SHEET_TAB || "ChiPhiThang";
export const SHEET_RANGE = process.env.SHEET_RANGE || `${SHEET_TAB}!A:C`;
export type Allocation = "calendar_days" | "working_days";
export const ALLOCATION: Allocation = "calendar_days";

/** Bật mock khi thiếu credential (để dashboard render ngay khi mới deploy). */
export const USE_MOCK_WHEN_UNCONFIGURED = true;
