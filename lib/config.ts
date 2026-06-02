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
export const NHANH_STORES = ["144344"]; // ["144344", "219805"] nếu cộng cả 2

/**
 * ---------------------------------------------------------------------------
 *  NHANH.VN — Mã sale_channel (STRING số) -> tên kênh báo cáo
 *  Giá trị thực có trong data: "1", "10", "20", "42", "48".
 *  ⚠️ TODO XÁC NHẬN với Nhanh.vn (Cấu hình > Nguồn đơn) ý nghĩa từng mã.
 *  Mã không khai báo ở đây sẽ gom vào "_unmapped" (không tính vào kênh nào).
 * ---------------------------------------------------------------------------
 */
export const SALE_CHANNEL_MAP: Record<string, ChannelName> = {
  // "48": "TikTok TDG",   // mã nhiều đơn nhất — RẤT CÓ THỂ là TikTok
  // "1":  "CSKH",
  // "42": "Shopee",
  // "20": "Facebook",
  // "10": "Sỉ",
};

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
export const STATUS_SUCCESS = ["60"]; // ["60"]  đơn thành công
export const STATUS_CANCELLED = ["63", "72"]; // huỷ + hoàn (xác nhận lại)
// "created" = mọi đơn, không cần khai báo.

/**
 * ---------------------------------------------------------------------------
 *  NHANH.VN — Tên cột tiền/ngày (tất cả cột là STRING -> phải SAFE_CAST)
 *  Doanh thu mỗi đơn = SUM(product_price * product_qty) trừ discount  (grain = line item)
 *  Giá vốn (COGS)    = SUM(product_avg_cost * product_qty)
 *  Mốc thời gian lọc theo ngày: created_at (đơn tạo) / success_at (đơn thành công).
 *  ⚠️ success_at hiện rỗng trong data -> tạm dùng created_at cho cả 3 nhóm.
 * ---------------------------------------------------------------------------
 */
export const NHANH_DATE_COL = "created_at"; // dùng để lọc theo ngày báo cáo

/**
 * ---------------------------------------------------------------------------
 *  CHI PHÍ ADS (màu "báo cáo Ads") -> tổng vào dòng "8. Chi phí quảng cáo"
 *  Nguồn ứng viên (asia-southeast1):
 *    Facebook : facebook_ads_dwh.facebook_ads_ads_insights        (spend)
 *    Shopee   : shopee_ads_dwh.shopee_cpc_ads_daily_performance_* (expense)
 *    TikTok   : tiktok_ads_dwh.tiktok_ads_<hash>                  (spend)
 *  ⚠️ TODO XÁC NHẬN account/campaign nào thuộc kênh nào + cột spend + cột ngày.
 *  Khi chưa cấu hình -> trả 0 (hoặc dùng mock).
 * ---------------------------------------------------------------------------
 */
export const ADS_ENABLED = false;

/**
 * ---------------------------------------------------------------------------
 *  PHÍ SÀN (màu "Sàn") -> tổng vào dòng "9. Phí sàn TMĐT"
 *  Nguồn ứng viên:
 *    Shopee : shopee_dwh.shopee_payment_escrow_detail_* (các cột fee/commission)
 *    TikTok : tiktok_shop_dwh.* (statement / settlement)
 *  ⚠️ TODO XÁC NHẬN cột phí + cách khớp theo ngày.
 * ---------------------------------------------------------------------------
 */
export const PLATFORM_FEE_ENABLED = false;

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
