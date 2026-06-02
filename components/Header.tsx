export function Header({ fromDate, toDate, updatedAt }: { fromDate: string; toDate: string; updatedAt: string; }) {
  const range = fromDate === toDate ? fromDate : `${fromDate} → ${toDate}`;
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-tdg-accent to-tdg-accent-dark
             flex items-center justify-center text-white font-bold shadow-[0_3px_12px_rgba(200,162,77,0.35)]">TĐ</div>
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-tdg-text leading-none">
            Báo cáo kết quả hằng ngày
          </h1>
          <p className="text-tdg-secondary text-xs italic mt-1">Dưỡng sinh là dưỡng mệnh · TDG Tea</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-tdg-accent text-sm font-semibold">{range}</div>
        <div className="text-tdg-secondary text-[11px]">Cập nhật {new Date(updatedAt).toLocaleString("vi-VN")}</div>
      </div>
    </div>
  );
}
