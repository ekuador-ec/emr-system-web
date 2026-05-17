import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { chartColorAt } from "./chartPalette";

interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ label: string; value: number }>;
  isLoading?: boolean;
  height?: number;
  totalLabel?: string;
}

export function DonutChartCard({
  title,
  subtitle,
  data,
  isLoading,
  height = 280,
  totalLabel,
}: DonutChartCardProps) {
  const total = useMemo(
    () => data.reduce((acc, point) => acc + (point.value || 0), 0),
    [data],
  );
  const isEmpty = !isLoading && total === 0;

  const colored = useMemo(
    () =>
      data.map((point, index) => ({
        ...point,
        color: chartColorAt(index),
      })),
    [data],
  );

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      isLoading={isLoading}
      isEmpty={isEmpty}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={colored}
            dataKey="value"
            nameKey="label"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="var(--color-surface)"
          >
            {colored.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text)",
            }}
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value);
              const safe = Number.isFinite(num) ? num : 0;
              const percent = total ? ((safe / total) * 100).toFixed(1) : "0";
              return [`${safe} (${percent}%)`, name];
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-secondary)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {totalLabel && !isEmpty ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          {totalLabel}: <strong style={{ color: "var(--color-text)" }}>{total}</strong>
        </div>
      ) : null}
    </ChartCard>
  );
}
