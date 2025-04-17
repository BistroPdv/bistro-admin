import Chart from "@/components/Charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RiGroupLine,
  RiMoneyDollarCircleLine,
  RiShoppingCartLine,
  RiStarLine,
} from "@remixicon/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Dashboard",
};

const salesData = [
  { name: "Seg", total: 1200, online: 400, presencial: 800 },
  { name: "Ter", total: 1650, online: 550, presencial: 1100 },
  { name: "Qua", total: 1400, online: 450, presencial: 950 },
  { name: "Qui", total: 2100, online: 700, presencial: 1400 },
  { name: "Sex", total: 2800, online: 900, presencial: 1900 },
  { name: "Sab", total: 3200, online: 1000, presencial: 2200 },
  { name: "Dom", total: 2100, online: 600, presencial: 1500 },
];

const topProducts = [
  { name: "Picanha na Brasa", amount: 28, rating: 4.8 },
  { name: "Risoto de Camarão", amount: 24, rating: 4.7 },
  { name: "Filé à Parmegiana", amount: 21, rating: 4.6 },
  { name: "Salmão Grelhado", amount: 19, rating: 4.9 },
  { name: "Massa ao Molho Pesto", amount: 17, rating: 4.5 },
];

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Hoje</span>
          <span className="text-sm font-medium">15/04/2024</span>
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
            <div className="text-2xl font-bold">R$ 3.580,00</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <RiShoppingCartLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Atendidos
            </CardTitle>
            <RiGroupLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">
              +5% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avaliação Média
            </CardTitle>
            <RiStarLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">
              +0.2 em relação a ontem
            </p>
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
            <Chart data={salesData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pratos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 pratos do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((item) => (
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
