import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { chartColorAt } from "./chartPalette";

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ label: string; value: number }>;
  isLoading?: boolean;
  height?: number;
  layout?: "horizontal" | "vertical";
  valueFormatter?: (value: number) => string;
  colorByIndex?: boolean;
}

export function BarChartCard({
  title,
  subtitle,
  data,
  isLoading,
  height = 280,
  layout = "horizontal",
  valueFormatter,
  colorByIndex = false,
}: BarChartCardProps) {
  const isEmpty = !isLoading && (!data || data.length === 0);
  const primaryColor = useMemo(() => chartColorAt(0), []);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      isLoading={isLoading}
      isEmpty={isEmpty}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            horizontal={layout === "horizontal"}
            vertical={layout === "vertical"}
          />
          {layout === "horizontal" ? (
            <>
              <XAxis
                dataKey="label"
                stroke="var(--color-text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tickFormatter={valueFormatter}
                width={40}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                stroke="var(--color-text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tickFormatter={valueFormatter}
              />
              <YAxis
                type="category"
                dataKey="label"
                stroke="var(--color-text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={120}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text)",
            }}
            cursor={{ fill: "var(--color-primary-light)", opacity: 0.4 }}
            formatter={(value) => {
              const num = typeof value === "number" ? value : Number(value);
              if (!Number.isFinite(num)) return String(value ?? "");
              return valueFormatter ? valueFormatter(num) : String(num);
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} fill={primaryColor}>
            {colorByIndex
              ? data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartColorAt(index)} />
                ))
              : null}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
