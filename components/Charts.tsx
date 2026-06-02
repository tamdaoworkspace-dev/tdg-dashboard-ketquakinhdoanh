"use client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area, Line, LineChart,
} from "recharts";
import type { ChannelRow } from "@/lib/types";
import { fmtVND, fmtVNDFull } from "@/lib/types";
import { TDG, TDG_CHART_COLORS } from "@/lib/colors";
import { channelProfit } from "@/lib/report";

const tip = {
  background: TDG.card, border: `1px solid ${TDG.accent}`,
  borderRadius: 12, color: TDG.text, fontSize: 12,
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-tdg-card rounded-ios-lg border border-tdg-border p-4 animate-fade-up">
      <h3 className="text-sm font-bold text-tdg-text mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function RevenueByChannel({ channels }: { channels: ChannelRow[] }) {
  const data = channels
    .filter((c) => c.success.revenue > 0)
    .map((c) => ({ name: c.name, value: c.success.revenue }))
    .sort((a, b) => b.value - a.value);
  return (
    <Card title="Doanh thu thành công theo kênh">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: 4, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,162,77,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: TDG.secondary, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtVND} tick={{ fill: TDG.secondary, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
          <Tooltip contentStyle={tip} formatter={(v: number) => fmtVNDFull(v)} cursor={{ fill: "rgba(200,162,77,0.06)" }} />
          <Bar dataKey="value" fill={TDG.accent} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ProfitByChannel({ channels }: { channels: ChannelRow[] }) {
  const data = channels
    .filter((c) => c.success.revenue > 0 || channelProfit(c) !== 0)
    .map((c) => ({ name: c.name, value: Math.round(channelProfit(c)) }))
    .sort((a, b) => b.value - a.value);
  return (
    <Card title="Lợi nhuận theo kênh">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: 4, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,162,77,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: TDG.secondary, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtVND} tick={{ fill: TDG.secondary, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
          <Tooltip contentStyle={tip} formatter={(v: number) => fmtVNDFull(v)} cursor={{ fill: "rgba(200,162,77,0.06)" }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.value >= 0 ? TDG.positive : TDG.negative} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function CostDonut({ data }: { data: { label: string; value: number }[] }) {
  const rows = data.filter((d) => d.value > 0);
  return (
    <Card title="Cơ cấu chi phí">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="none">
            {rows.map((_, i) => <Cell key={i} fill={TDG_CHART_COLORS[i % TDG_CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tip} formatter={(v: number) => fmtVNDFull(v)} />
          <Legend wrapperStyle={{ fontSize: 11, color: TDG.secondary }} />
        </PieChart>
      </ResponsiveContainer>
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
          <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fill: TDG.secondary, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtVND} tick={{ fill: TDG.secondary, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
          <Tooltip contentStyle={tip} formatter={(v: number) => fmtVNDFull(v)} labelFormatter={fmtDay} />
          <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke={TDG.accent} strokeWidth={2} fill="url(#tdgRev)" dot={false} />
          <Line type="monotone" dataKey="profit" name="Lợi nhuận" stroke={TDG.positive} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
