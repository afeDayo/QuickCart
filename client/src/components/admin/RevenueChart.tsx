// RevenueChart.tsx client/src/components/admin/RevenueChart.tsx
// "Revenue & Sales Performance": the sales per day (or per month for Year) as a smooth line with a soft fill, and a
// dashed line for the period's average. Drawn with Chart.js (already in package.json) through react-chartjs-2.

// STEP 41 (part 7): The sales chart

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { DashboardResponse } from "../../types/admin";
import { naira } from "../../utils/format";

// Chart.js only includes the parts you register (it keeps the website smaller)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

// Your colours from index.css (Chart.js draws on a <canvas>, which can't read Tailwind classes)
const PRIMARY = "#322bd0";
const MUTED = "#565e74";
const GRID = "#eaf2ff";

// 1200000 -> "₦1.2M", 900000 -> "₦900K" (short labels for the left axis)
const shortNaira = (value: number) =>
  value >= 1_000_000
    ? `₦${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    : value >= 1000
      ? `₦${Math.round(value / 1000)}K`
      : `₦${value}`;

const RevenueChart = ({ chart }: { chart: DashboardResponse["chart"] }) => {
  const average =
    chart.length > 0
      ? chart.reduce((sum, point) => sum + point.sales, 0) / chart.length
      : 0;

  const data = {
    labels: chart.map((point) => point.label),
    datasets: [
      {
        label: "Sales",
        data: chart.map((point) => point.sales),
        borderColor: PRIMARY,
        borderWidth: 3,
        tension: 0.4, // curves the line
        cubicInterpolationMode: "monotone" as const, // ...without dipping below ₦0 between days
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: PRIMARY,
        fill: true,
        // A fill that fades from light purple to nothing (a gradient needs the chart's size, so it's a function)
        backgroundColor: (context: ScriptableContext<"line">) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return "rgba(50,43,208,0.12)";
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          gradient.addColorStop(0, "rgba(50,43,208,0.25)");
          gradient.addColorStop(1, "rgba(50,43,208,0)");
          return gradient;
        },
      },
      {
        label: "Period average",
        data: chart.map(() => average),
        borderColor: "#a3a1b8",
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // fill the box's height (set by the parent div)
    interaction: { mode: "index" as const, intersect: false }, // hovering anywhere above a day shows that day
    plugins: {
      tooltip: {
        backgroundColor: "#0b1c30",
        padding: 12,
        callbacks: {
          label: (item: {
            dataset: { label?: string };
            parsed: { y: number | null };
          }) => `${item.dataset.label}: ${naira(item.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: MUTED, maxTicksLimit: 7, maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: GRID },
        border: { display: false },
        ticks: {
          color: MUTED,
          callback: (value: string | number) => shortNaira(Number(value)),
        },
      },
    },
  };

  return (
    <div
      className="h-80"
      role="img"
      aria-label={`Sales chart, ${chart.length} points. Period average ${naira(Math.round(average))}.`}
    >
      <Line data={data} options={options} />
    </div>
  );
};

export default RevenueChart;
