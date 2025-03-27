"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("@/components/Charts"), {
  ssr: false,
});

interface ChartSectionProps {
  data: Array<{ name: string; total: number }>;
}

export function ChartSection({ data }: ChartSectionProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Visão Geral da Semana</CardTitle>
        <CardDescription>Receita diária dos últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <Chart data={data} />
      </CardContent>
    </Card>
  );
}
