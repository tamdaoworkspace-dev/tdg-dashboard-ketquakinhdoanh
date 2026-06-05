// lib/colors.ts — Bảng màu TDG Tea, GIAO DIỆN SÁNG (light). Đạt tương phản WCAG AA.
export const TDG = {
  // nền & bề mặt
  bg: "#F7F3EA",          // nền kem ấm
  card: "#FFFFFF",        // thẻ trắng
  cardAlt: "#FBF8F1",     // nền phụ (hàng tổng, header bảng)
  // chữ
  text: "#2B2620",        // chữ chính (tương phản cao trên trắng)
  secondary: "#7A7263",   // chữ phụ
  // thương hiệu (đậm hơn để đọc rõ trên nền sáng)
  accent: "#B0862F",      // vàng trà đậm (AA cho chữ nhỏ trên trắng)
  accentSoft: "#C8A24D",  // vàng trà (cho cột/biểu đồ)
  accentLight: "#E8C76A",
  accentDark: "#8C6A24",
  brown: "#7A5A12",
  // ngữ nghĩa
  positive: "#4F7A2E",    // xanh lá trà (AA)
  positiveSoft: "#5D8A3C",
  negative: "#B14528",    // đỏ trà (AA)
  warm: "#C26A3F",
  // đường viền & lưới
  border: "#ECE4D2",
  grid: "#F0E9D8",
} as const;

// Palette cho biểu đồ — tông ấm, phân biệt rõ trên nền trắng
export const TDG_CHART_COLORS = [
  "#C8A24D", "#5D8A3C", "#C26A3F", "#8C6A24", "#E8C76A", "#7FB356", "#7A5A12",
];
