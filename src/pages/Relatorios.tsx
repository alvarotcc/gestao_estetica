import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, BarChart, FileText } from "lucide-react";

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [filter, setFilter] = useState({ startDate: "", endDate: "" });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = () => {
    // Lógica para gerar o relatório com base nos filtros
    const mockData = [
      { id: 1, type: "Serviços", value: 15000, period: "Mês atual" },
      { id: 2, type: "Despesas", value: 5000, period: "Mês atual" },
      { id: 3, type: "Lucro", value: 10000, period: "Mês atual" },
    ];
    setRelatorios(mockData);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Relatórios e Métricas</CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleGenerateReport}>
              <BarChart className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4 items-center">
            <div className="flex-1">
              <label htmlFor="startDate" className="sr-only">Data de Início</label>
              <input 
                id="startDate" 
                name="startDate" 
                type="date" 
                value={filter.startDate} 
                onChange={handleFilterChange} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="sr-only">Data de Fim</label>
              <input 
                id="endDate" 
                name="endDate" 
                type="date" 
                value={filter.endDate} 
                onChange={handleFilterChange} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Período</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorios.length > 0 ? (
                relatorios.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>R$ {report.value.toFixed(2)}</TableCell>
                    <TableCell>{report.period}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Nenhum relatório gerado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
