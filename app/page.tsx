"use client";

import { ScriptsListCard } from "@/components/scripts-list-card";
import { BarCharts } from "@/components/bar-charts";
import { HorizontalBarChart } from "@/components/horizontal-bar-chart";
import { ScriptPieChart } from "@/components/scripts-pie-chart";
import { Toaster } from "@/components/ui/toaster";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 space-y-4">
      <div className="grid auto-rows-min gap-4 px-4 lg:grid-cols-3">
        <BarCharts />
        <HorizontalBarChart />
        <ScriptPieChart />
      </div>
      <ScriptsListCard />
      <Toaster />
    </main>
  );
}
