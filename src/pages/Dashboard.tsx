import { Users, Wrench, DollarSign, TrendingDown } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio de estética automotiva</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Clientes"
          value="147"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Serviços no Mês"
          value="89"
          icon={Wrench}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Receita Bruta"
          value="R$ 25.400"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        <MetricCard
          title="Despesas Totais"
          value="R$ 13.500"
          icon={TrendingDown}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* Charts and Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <TodaySchedule />
        </div>
      </div>
    </div>
  );
}