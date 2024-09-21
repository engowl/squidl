import { Skeleton } from "@nextui-org/react";
import axios from "axios";
import dayjs from "dayjs";
import { useMemo } from "react";
import {
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Rectangle,
} from "recharts";
import useSWR from "swr";

const GRID_SIZE = 7;
const CHART_HEIGHT = 350;

export default function BalanceChart() {
  const { data: chartData, isLoading } = useSWR(
    "/stealth-address/chart/0x278A2d5B5C8696882d1D2002cE107efc74704ECf?chainIds=1,137",
    async (url) => {
      const { data } = await axios.get(`https://api.squidl.me` + url);
      const chartData = data.chart.map((chart) => ({
        date: dayjs.unix(chart.timestamp).format("DD/MM/YYYY"),
        usd: chart.value_usd,
      }));
      return chartData;
    }
  );

  const { pixelData, gridHeight } = useMemo(() => {
    if (!chartData || chartData.length === 0)
      return { pixelData: [], gridHeight: 0 };

    const gridWidth = chartData.length;
    const gridHeight = Math.floor(CHART_HEIGHT / GRID_SIZE);

    // Binning data into grid cells
    const binnedData = [];
    const binSize = Math.ceil(chartData.length / gridWidth);

    for (let i = 0; i < gridWidth; i++) {
      const binStart = i * binSize;
      const binEnd = binStart + binSize;
      const binData = chartData.slice(binStart, binEnd);
      const avgUsd =
        binData.reduce((sum, d) => sum + d.usd, 0) / binData.length || 0;

      binnedData.push({
        x: i,
        usd: avgUsd,
        dates: binData.map((d) => d.date),
      });
    }

    const maxUsd = Math.max(...binnedData.map((d) => d.usd));
    const minUsd = Math.min(...binnedData.map((d) => d.usd));
    const range = maxUsd - minUsd || 1; // Prevent division by zero

    const pixelData = binnedData.map((point) => {
      const normalizedValue = (point.usd - minUsd) / range;
      const yGridPos = Math.round((gridHeight - 1) * (1 - normalizedValue));
      return {
        x: point.x,
        y: yGridPos,
        usd: point.usd,
        dates: point.dates,
      };
    });

    return { pixelData, gridHeight };
  }, [chartData]);

  if (isLoading) {
    return <Skeleton className="bg-neutral-100 w-full h-72" />;
  }

  return (
    <div className="relative w-full h-full">
      <div
        style={{
          mask: `linear-gradient(0deg, transparent, #000 20%, #000 80%, transparent 100%)`,
        }}
        className="w-full h-full relative"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <pattern
                id="pixelGrid"
                width={GRID_SIZE}
                height={GRID_SIZE}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width={GRID_SIZE - 2}
                  height={GRID_SIZE - 2}
                  fill="rgba(128, 0, 255, 0.025)"
                />
              </pattern>
              <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9b5de5" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#9b5de5" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Background Grid */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#pixelGrid)"
            />
            {/* Axes Configuration */}
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, pixelData.length - 1]}
              tick={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, gridHeight - 1]}
              tick={false}
              axisLine={false}
              reversed={true} // Origin at the top-left corner
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Scatter Pixels with Extended Rectangles */}
            <Scatter
              data={pixelData}
              shape={(props) => {
                const { cx, cy, payload } = props;
                const size = GRID_SIZE - 2;
                const x = Math.floor(cx / GRID_SIZE) * GRID_SIZE;
                const y = Math.floor(cy / GRID_SIZE) * GRID_SIZE;

                // Number of grid cells from current y position to bottom
                const cellsToBottom = gridHeight - payload.y - 1;

                const rectangles = [];

                // Draw the main scatter rectangle with glow effect
                rectangles.push(
                  <Rectangle
                    key={`${payload.x}-${payload.y}-main`}
                    x={x}
                    y={y}
                    width={size}
                    height={size}
                    fill="#9b5de5"
                    stroke="none"
                    fillOpacity={1}
                    style={{ filter: "url(#glow)" }}
                  />
                );

                return <g>{rectangles}</g>;
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const dates = data.payload.dates || [];
    const usd = data.payload.usd;

    return (
      <div className="bg-white border rounded-2xl p-4 max-w-xl flex flex-col items-start">
        <p className="bg-purply-50 text-purply px-3 py-2 rounded-xl text-xs">
          {dates.length > 1
            ? `${dates[0]} - ${dates[dates.length - 1]}`
            : dates[0]}
        </p>
        <p className="mt-4 text-lg font-medium">${usd.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};
