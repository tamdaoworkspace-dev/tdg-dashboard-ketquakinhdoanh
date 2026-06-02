"use client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area, Line, LabelList,
} from "recharts";
import type { ChannelRow } from "@/lib/types";
import { fmtVND, fmtVNDFull } from "@/lib/types";
import { TDG, TDG_CHART_COLORS } from "@/lib/colors";
import { channelProfit } from "@/lib/report";

const tip = {
  background: TDG.card, border: `1px solid ${TDG.accent}`,
  borderRadius: 12, color: TDG.text, fontSize: 12,
};
const axisX = { fill: TDG.secondary, fontSize: 11 };

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-tdg-card rounded-ios-lg border border-tdg-border p-4 animate-fade-up">
      <h3 className="text-sm font-bold text-tdg-text">{title}</h3>
      {sub && <p className="text-[11px] text-tdg-secondary mb-2 mt-0.5">{sub}</p>}
      <div className={sub ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

const renderPct =
  (total: number) =>
  ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const pct = total > 0 ? value / total : 0;
    if (pct < 0.04) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + r * Math.sin((-midAngle * Math.PI) / 180);
    return (
      <text x={x} y={y} fill="#fff" fontSize={12} fontWeight={700}
        textAnchor="middle" dominantBaseline="central">
        {(pct * 100).toFixed(0)}%
      </text>
    );
  };

function Donut({ data }: { data: { label: string; value: number }[] }) {
  const rows = data.filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  const total = rows.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="label" innerRadius="56%" outerRadius="82%"
          startAngle={90} endAngle={-270} paddingAngle={2} stroke={TDG.card} strokeWidth={3}
          labelLine={false} label={renderPct(total)} isAnimationActive={false}>
          {rows.map((_, i) => <Cell key={i} fill={TDG_CHART_COLORS[i % TDG_CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tip}
          formatter={(v: number) => `${fmtVNDFull(v)} | ${((v / total) * 100).toFixed(1)}%`} />
        <Legend wrapperStyle={{ fontSize: 11, color: TDG.secondary }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RevenueByChannel({ channels }: { channels: ChannelRow[] }) {
  const data = channels
    .map((c) => ({ name: c.name, value: Math.round(c.success.revenue) }))
    .sort((a, b) => b.value - a.value);
  return (
    <Card title="Doanh thu thành công theo kênh" sub="Sắp xếp giảm dần · VNĐ">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, left: 4, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,162,77,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={axisX} axisLine={false} tickLine={false} interval={0} />
          <YAxis tickFormatter={fmtVND} tick={axisX} axisLine={false} tickLine={false} width={44} />
          <Tooltip contentStyle={tip} formatter={(v: number) => fmtVNDFull(v)} cursor={{ fill: "rgba(200,162,77,0.06)" }} />
          <Bar dataKey="value" fill={TDG.accent} radius={[8, 8, 0, 0]} maxBarSize={48} isAnimationActive={false}>
            <LabelList dataKey="value" position="top" fill={TDG.text} fontSize={10}
              formatter={(v: number) => (v ? fmtVND(v) : "")} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ProfitByChannel({ channels }: { channels: ChannelRow[] }) {
  const data = channels
    .map((c) => ({ name: c.name, value: Math.round(channelProfit(c)) }))
    .sort((a, b) => b.value - a.value);
  return (
    <Card title="Lợi nhuận theo kênh" sub="Xanh = lãi · Đỏ = lỗ · VNĐ">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, left: 4, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,162,77,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={axisX} axisLine={false} tickLine={false} interval={0} />
          <YAxis tickFormatter={fmtVND} tick={axisX} axisLine={false} tickLine={false} width={44} />
          <Tooltip contentStyle={tip} formatter={(v: number) => fmtVNDFull(v)} cursor={{ fill: "rgba(200,162,77,0.06)" }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.value >= 0 ? TDG.positive : TDG.negative} />)}
            <LabelList dataKey="value" position="top" fill={TDG.text} fontSize={10}
              formatter={(v: number) => (v ? fmtVND(v) : "")} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function CostDonut({ data }: { data: { label: string; value: number }[] }) {
  return (
    <Card title="Cơ cấu chi phí" sub="Tỷ trọng các khoản · VNĐ">
      <Donut data={data} />
    </Card>
  );
}

export function RevenueShareDonut({ channels }: { channels: ChannelRow[] }) {
  const data = channels.map((c) => ({ label: c.name, value: c.success.revenue }));
  return (
    <Card title="Tỷ trọng doanh thu theo kênh" sub="Lát lớn nhất ở 12 giờ · % trên tổng DT">
      <Donut data={data} />
    </Card>
  );
}

export function TrendChart({ data }: { data: { date: string; revenue: number; profit: number }[] }) {
  const fmtDay = (d: string) => d.slice(8, 10) + "/" + d.slice(5, 7);
  return (
    <Card title="Xu hướng doanh thu & lợi nhuận theo ngày">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ left: 4, right: 8 }}>
          <defs>
            <linearGradient id="tdgRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TDG.accent} stopOpacity={0.4} />
              <stop offset="100%" stopColor={TDG.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,162,77,0.06)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmtDay} tick={axisX} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtVND} tick={axisX} axisLine={false} tickLine={false} width={44} />
          <Tooltip contentStyle={tip} formatter={(v: number) => fmtVNDFull(v)} labelFormatter={fmtDay} />
          <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke={TDG.accent} strokeWidth={2} fill="url(#tdgRev)" dot={false} />
          <Line type="monotone" dataKey="profit" name="Lợi nhuận" stroke={TDG.positive} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
