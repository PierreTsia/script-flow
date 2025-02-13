"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ScriptsListCard } from "@/components/scripts-list-card";
import { BarCharts } from "@/components/bar-charts";
import { HorizontalBarChart } from "@/components/horizontal-bar-chart";
import { ScriptPieChart } from "@/components/scripts-pie-chart";
// Mock data
const elementData = [
  { category: "Characters", count: 24 },
  { category: "Props", count: 45 },
  { category: "Costumes", count: 18 },
  { category: "Locations", count: 12 },
];

const sceneTypeData = [
  { type: "Interior", value: 65 },
  { type: "Exterior", value: 35 },
];

const scriptData = [
  { script: "Script 1", day: 14, night: 2 },
  { script: "Script 2", day: 10, night: 6 },
  { script: "Script 3", day: 8, night: 8 },
  { script: "Script 4", day: 4, night: 12 },
  { script: "Script 5", day: 2, night: 14 },
];

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 space-y-4">
      <div className="grid auto-rows-min gap-4 px-4 lg:grid-cols-3">
        {/* Element Distribution Chart */}
        <BarCharts />
        <HorizontalBarChart />
        <ScriptPieChart />
        {/*    <ChartContainer
          config={chartConfig}
          className="min-h-[200px] w-full rounded-xl p-4"
        >
          <BarChart accessibilityLayer data={scriptData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="script"
              tickLine={false}
              tickMargin={1}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent nameKey="script" />} />
            <Bar dataKey="day" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="night" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer> */}
      </div>

      <ScriptsListCard />
    </div>
  );
}

/* import { ScriptUploadCard } from "@/components/script-upload-card";
import { ScriptsListCard } from "@/components/scripts-list-card";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container px-4 sm:px-6 py-8 mx-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <ScriptUploadCard />
          <ScriptsListCard />
        </div>
        <Toaster />
      </main>
    </div>
  );
}
 */
