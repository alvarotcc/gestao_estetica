import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { mes: "Jan", receita: 12500, despesas: 8200 },
  { mes: "Fev", receita: 15200, despesas: 9100 },
  { mes: "Mar", receita: 18700, despesas: 10500 },
  { mes: "Abr", receita: 22100, despesas: 11800 },
  { mes: "Mai", receita: 19800, despesas: 10200 },
  { mes: "Jun", receita: 25400, despesas: 13500 },
];

export function RevenueChart() {
  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Receita vs Despesas - Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="mes" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `R$ ${value.toLocaleString('pt-BR')}`, 
                name === 'receita' ? 'Receita' : 'Despesas'
              ]}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)'
              }}
            />
            <Bar 
              dataKey="receita" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="receita"
            />
            <Bar 
              dataKey="despesas" 
              fill="hsl(var(--accent))" 
              radius={[4, 4, 0, 0]}
              name="despesas"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}