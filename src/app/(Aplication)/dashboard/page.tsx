"use client";
import { DashboardTypes } from "@/@types/dashboard";
import Chart from "@/components/Charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import {
  RiDashboard2Line,
  RiGroupLine,
  RiMoneyDollarCircleLine,
  RiShoppingCartLine,
  RiStarLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

export default function Page() {
  const dataDashboard = useQuery<AxiosResponse, Error, DashboardTypes>({
    queryKey: ["dataDashboard"],
    queryFn: () => api.get(`/dashboard`),
    select: (data) => data.data,
  });

  const { totalSales, totalOnline, totalPresencial, length } =
    dataDashboard.data || {
      totalSales: 0,
      totalOnline: 0,
      totalPresencial: 0,
      length: 0,
    };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex gap-2 items-center">
          <RiDashboard2Line /> Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Hoje</span>
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total Hoje
            </CardTitle>
            <RiMoneyDollarCircleLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalSales)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Online
            </CardTitle>
            <RiShoppingCartLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOnline}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Presenciais
            </CardTitle>
            <RiGroupLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPresencial}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pedidos
            </CardTitle>
            <RiStarLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Vendas Semanais</CardTitle>
            <CardDescription>
              Total de vendas nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart data={dataDashboard.data?.sales || []} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pratos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 pratos do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataDashboard.data?.topProducts.map((item) => (
                <div
                  className="flex items-center justify-between"
                  key={item.name}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">
                        {item.amount} pedidos
                      </p>
                      <div className="flex items-center">
                        <RiStarLine className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
