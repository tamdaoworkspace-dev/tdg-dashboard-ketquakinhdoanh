import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TDG · Báo cáo kết quả hằng ngày",
  description: "Dưỡng sinh là dưỡng mệnh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-sans">{children}</body>
    </html>
  );
}
