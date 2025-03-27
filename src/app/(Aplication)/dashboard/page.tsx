import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Admin - Dashboard",
};

const data = [
  { name: "Seg", total: 1200 },
  { name: "Ter", total: 1650 },
  { name: "Qua", total: 1400 },
  { name: "Qui", total: 2100 },
  { name: "Sex", total: 2800 },
  { name: "Sab", total: 3200 },
  { name: "Dom", total: 2100 },
];

// Remove the dynamic import
import { ChartSection } from "@/components/ChartSection";
import { RiGroupLine, RiRestaurant2Line, RiTimeLine } from "@remixicon/react";
import { LucideDollarSign } from "lucide-react";

export default function Page() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total Hoje
            </CardTitle>
            <LucideDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 3.580,00</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <RiRestaurant2Line className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio de Preparo
            </CardTitle>
            <RiTimeLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 min</div>
            <p className="text-xs text-muted-foreground">
              -2 min em relação a ontem
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartSection data={data} />

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pratos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 pratos do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Picanha na Brasa", amount: "28" },
                { name: "Risoto de Camarão", amount: "24" },
                { name: "Filé à Parmegiana", amount: "21" },
                { name: "Salmão Grelhado", amount: "19" },
                { name: "Massa ao Molho Pesto", amount: "17" },
              ].map((item) => (
                <div className="flex items-center" key={item.name}>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.amount} pedidos
                    </p>
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
