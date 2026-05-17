import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { chartPalette } from "./chartPalette";

export interface LineChartSeries {
  key: string;
  label: string;
  color?: string;
}

interface LineChartCardProps {
  title: string;
  subtitle?: string;
  series: LineChartSeries[];
  data: Array<Record<string, string | number>>;
  xKey: string;
  formatXTick?: (value: string | number) => string;
  formatYTick?: (value: number) => string;
  isLoading?: boolean;
  height?: number;
}

export function LineChartCard({
  title,
  subtitle,
  series,
  data,
  xKey,
  formatXTick,
  formatYTick,
  isLoading,
  height = 280,
}: LineChartCardProps) {
  const palette = chartPalette();
  const resolvedSeries = useMemo(
    () =>
      series.map((s, index) => ({
        ...s,
        color: s.color ?? palette[index % palette.length],
      })),
    [series, palette],
  );

  const isEmpty = !isLoading && (!data || data.length === 0);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      isLoading={isLoading}
      isEmpty={isEmpty}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            {resolvedSeries.map((s) => (
              <linearGradient
                key={s.key}
                id={`gradient-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="var(--color-text-secondary)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXTick}
          />
          <YAxis
            stroke="var(--color-text-secondary)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={formatYTick}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text)",
            }}
            labelStyle={{ color: "var(--color-text-secondary)" }}
            labelFormatter={(label) =>
              formatXTick ? formatXTick(label as string | number) : String(label)
            }
          />
          <Legend
            wrapperStyle={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-secondary)",
            }}
            iconType="circle"
          />
          {resolvedSeries.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#gradient-${s.key})`}
              activeDot={{ r: 4 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
