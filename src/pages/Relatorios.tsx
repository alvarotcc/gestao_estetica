import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Car, Wrench, Package, Calendar, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cpfCnpj: string;
  aniversario: string;
  observacoes: string;
  veiculos: number;
  servicos: number;
}

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  clienteId: string;
}

interface Service {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
}

interface Material {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
}

interface Appointment {
  id: string;
  clienteId: string;
  clienteNome: string;
  veiculoId: string;
  veiculoPlaca: string;
  servicoId: string;
  servicoNome: string;
  colaboradorId: string;
  colaboradorNome: string;
  data: string;
  hora: string;
  status: string;
  observacoes: string;
}

interface Employee {
  id: string;
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
}

export default function Relatorios() {
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    // Buscar dados de todas as coleções
    const clientsCollection = collection(db, "clientes");
    const vehiclesCollection = collection(db, "veiculos");
    const servicesCollection = collection(db, "servicos");
    const materialsCollection = collection(db, "materiais");
    const appointmentsCollection = collection(db, "agendamentos");
    const employeesCollection = collection(db, "colaboradores");

    const unsubscribeClients = onSnapshot(clientsCollection, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      setClients(clientsData);
    });

    const unsubscribeVehicles = onSnapshot(vehiclesCollection, (snapshot) => {
      const vehiclesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehiclesData);
    });

    const unsubscribeServices = onSnapshot(servicesCollection, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);
    });

    const unsubscribeMaterials = onSnapshot(materialsCollection, (snapshot) => {
      const materialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Material[];
      setMaterials(materialsData);
    });

    const unsubscribeAppointments = onSnapshot(appointmentsCollection, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
    });

    const unsubscribeEmployees = onSnapshot(employeesCollection, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
      setEmployees(employeesData);
    });

    return () => {
      unsubscribeClients();
      unsubscribeVehicles();
      unsubscribeServices();
      unsubscribeMaterials();
      unsubscribeAppointments();
      unsubscribeEmployees();
    };
  }, []);

  // Calcular métricas
  const totalClients = clients.length;
  const totalVehicles = vehicles.length;
  const totalServices = services.length;
  const totalMaterials = materials.length;
  const totalAppointments = appointments.length;
  const totalEmployees = employees.length;

  // Filtrar agendamentos baseado nos filtros e relacionar dados corretamente
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.data);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    if (fromDate && aptDate < fromDate) return false;
    if (toDate && aptDate > toDate) return false;
    if (selectedClient && selectedClient !== "undefined" && apt.clienteId !== selectedClient) return false;
    if (selectedService && selectedService !== "undefined" && apt.servicoId !== selectedService) return false;
    if (selectedEmployee && selectedEmployee !== "undefined" && apt.colaboradorId !== selectedEmployee) return false;
    if (selectedVehicle && selectedVehicle !== "undefined" && apt.veiculoId !== selectedVehicle) return false;
    return true;
  });

  // Filtrar veículos relacionados ao cliente selecionado
  const filteredVehicles = selectedClient
    ? vehicles.filter(vehicle => vehicle.clienteId === selectedClient)
    : vehicles;

  // Filtrar serviços relacionados aos agendamentos filtrados
  const filteredServices = selectedService
    ? services.filter(service => service.id === selectedService)
    : services;

  // Filtrar colaboradores relacionados aos agendamentos filtrados
  const filteredEmployees = selectedEmployee
    ? employees.filter(employee => employee.id === selectedEmployee)
    : employees;

  // Filtrar materiais relacionados aos serviços filtrados (exemplo de ligação)
  // Aqui você pode implementar a lógica para relacionar materiais aos serviços, se aplicável
  const filteredMaterials = materials; // Ajuste conforme a lógica de relacionamento

  // Atualizar dados para gráficos com base nos dados filtrados e relacionados
  const servicesChartData = filteredServices.map(service => {
    const count = filteredAppointments.filter(apt => apt.servicoNome === service.nome).length;
    return {
      name: service.nome,
      value: count,
      revenue: count * service.preco
    };
  }).filter(item => item.value > 0);

  const statusChartData = [
    { name: "Agendado", value: filteredAppointments.filter(apt => apt.status === "agendado").length, color: "#8884d8" },
    { name: "Em Andamento", value: filteredAppointments.filter(apt => apt.status === "em_andamento").length, color: "#82ca9d" },
    { name: "Concluído", value: filteredAppointments.filter(apt => apt.status === "concluido").length, color: "#ffc658" },
    { name: "Cancelado", value: filteredAppointments.filter(apt => apt.status === "cancelado").length, color: "#ff7c7c" }
  ].filter(item => item.value > 0);

  // Receita estimada baseada nos serviços agendados
  const estimatedRevenue = filteredAppointments
    .filter(apt => apt.status === "concluido")
    .reduce((total, apt) => {
      const service = filteredServices.find(s => s.nome === apt.servicoNome);
      return total + (service?.preco || 0);
    }, 0);

  // Dados para gráfico de serviços mais realizados
  // Removido duplicação, usando filteredServices e filteredAppointments já definidos
  // const servicesChartData = services.map(service => {
  //   const count = filteredAppointments.filter(apt => apt.servicoNome === service.nome).length;
  //   return {
  //     name: service.nome,
  //     value: count,
  //     revenue: count * service.preco
  //   };
  // }).filter(item => item.value > 0);

  // Dados para gráfico de status dos agendamentos
  // Removido duplicação, usando filteredAppointments já definido
  // const statusChartData = [
  //   { name: "Agendado", value: filteredAppointments.filter(apt => apt.status === "agendado").length, color: "#8884d8" },
  //   { name: "Em Andamento", value: filteredAppointments.filter(apt => apt.status === "em_andamento").length, color: "#82ca9d" },
  //   { name: "Concluído", value: filteredAppointments.filter(apt => apt.status === "concluido").length, color: "#ffc658" },
  //   { name: "Cancelado", value: filteredAppointments.filter(apt => apt.status === "cancelado").length, color: "#ff7c7c" }
  // ].filter(item => item.value > 0);

  // Dados para gráfico de receita mensal (simulado)
  const revenueChartData = [
    { month: "Jan", revenue: 12500 },
    { month: "Fev", revenue: 15200 },
    { month: "Mar", revenue: 18300 },
    { month: "Abr", revenue: 16800 },
    { month: "Mai", revenue: 22100 },
    { month: "Jun", revenue: 19800 }
  ];

  // Funções para os botões
  const handleGeneratePDF = () => {
    setDialogOpen(true);
  };

  const renderPDFContent = (doc: jsPDF) => {
    doc.setFontSize(20);
    doc.text("Relatório de Gestão Estética", 20, 20);

    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);

    let y = 60;
    doc.text("Filtros Aplicados:", 20, y);
    y += 10;

    if (dateFrom) {
      doc.text(`Data Início: ${dateFrom}`, 20, y);
      y += 10;
    }
    if (dateTo) {
      doc.text(`Data Fim: ${dateTo}`, 20, y);
      y += 10;
    }
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      doc.text(`Cliente: ${client?.nome}`, 20, y);
      y += 10;
    }
    if (selectedService) {
      const service = services.find(s => s.id === selectedService);
      doc.text(`Serviço: ${service?.nome}`, 20, y);
      y += 10;
    }
    if (selectedEmployee) {
      const employee = employees.find(e => e.id === selectedEmployee);
      doc.text(`Colaborador: ${employee?.nome}`, 20, y);
      y += 10;
    }
    if (selectedVehicle) {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      doc.text(`Veículo: ${vehicle?.placa} - ${vehicle?.marca} ${vehicle?.modelo}`, 20, y);
      y += 10;
    }

    y += 10;
    doc.text("Agendamentos Filtrados:", 20, y);
    y += 15;

    filteredAppointments.forEach((apt, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.text(`${index + 1}. Cliente: ${apt.clienteNome}`, 20, y);
      y += 8;
      doc.text(`   Serviço: ${apt.servicoNome}`, 20, y);
      y += 8;
      doc.text(`   Veículo: ${apt.veiculoPlaca}`, 20, y);
      y += 8;
      doc.text(`   Colaborador: ${apt.colaboradorNome}`, 20, y);
      y += 8;
      doc.text(`   Data: ${apt.data} - Hora: ${apt.hora}`, 20, y);
      y += 8;
      doc.text(`   Status: ${apt.status}`, 20, y);
      if (apt.observacoes) {
        y += 8;
        doc.text(`   Observações: ${apt.observacoes}`, 20, y);
      }
      y += 15;
    });

    // Adicionar métricas no final
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    y += 10;
    doc.text("Métricas:", 20, y);
    y += 15;

    doc.setFontSize(10);
    doc.text(`Total de Clientes: ${totalClients}`, 20, y);
    y += 8;
    doc.text(`Total de Veículos: ${totalVehicles}`, 20, y);
    y += 8;
    doc.text(`Total de Serviços: ${totalServices}`, 20, y);
    y += 8;
    doc.text(`Agendamentos Filtrados: ${filteredAppointments.length}`, 20, y);
    y += 8;
    doc.text(`Receita Estimada: R$ ${estimatedRevenue.toLocaleString('pt-BR')}`, 20, y);
    y += 8;
    doc.text(`Total de Colaboradores: ${totalEmployees}`, 20, y);
  };

  const handlePrintReport = () => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Gestão Estética</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #333;
              margin: 0;
              font-size: 24px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .section {
              margin-bottom: 20px;
            }
            .section h3 {
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .appointment {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 15px;
              background-color: #f9f9f9;
            }
            .appointment strong {
              display: inline-block;
              width: 120px;
            }
            .metrics {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-top: 30px;
            }
            .metric-item {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
            }
            @media print {
              body { margin: 0; }
              .appointment { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Gestão Estética</h1>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div class="section">
            <h3>Filtros Aplicados:</h3>
            ${dateFrom ? `<p><strong>Data Início:</strong> ${dateFrom}</p>` : ''}
            ${dateTo ? `<p><strong>Data Fim:</strong> ${dateTo}</p>` : ''}
            ${selectedClient ? `<p><strong>Cliente:</strong> ${clients.find(c => c.id === selectedClient)?.nome}</p>` : ''}
            ${selectedService ? `<p><strong>Serviço:</strong> ${services.find(s => s.id === selectedService)?.nome}</p>` : ''}
            ${selectedEmployee ? `<p><strong>Colaborador:</strong> ${employees.find(e => e.id === selectedEmployee)?.nome}</p>` : ''}
            ${selectedVehicle ? `<p><strong>Veículo:</strong> ${vehicles.find(v => v.id === selectedVehicle)?.placa} - ${vehicles.find(v => v.id === selectedVehicle)?.marca} ${vehicles.find(v => v.id === selectedVehicle)?.modelo}</p>` : ''}
          </div>

          <div class="section">
            <h3>Agendamentos Filtrados:</h3>
            ${filteredAppointments.length > 0 ? filteredAppointments.map((apt, index) => `
              <div class="appointment">
                <p><strong>${index + 1}. Cliente:</strong> ${apt.clienteNome}</p>
                <p><strong>Serviço:</strong> ${apt.servicoNome}</p>
                <p><strong>Veículo:</strong> ${apt.veiculoPlaca}</p>
                <p><strong>Colaborador:</strong> ${apt.colaboradorNome}</p>
                <p><strong>Data:</strong> ${apt.data} - <strong>Hora:</strong> ${apt.hora}</p>
                <p><strong>Status:</strong> ${apt.status}</p>
                ${apt.observacoes ? `<p><strong>Observações:</strong> ${apt.observacoes}</p>` : ''}
              </div>
            `).join('') : '<p>Nenhum agendamento encontrado com os filtros aplicados.</p>'}
          </div>

          <div class="metrics">
            <div class="metric-item">
              <h4>Métricas Gerais:</h4>
              <p><strong>Total de Clientes:</strong> ${totalClients}</p>
              <p><strong>Total de Veículos:</strong> ${totalVehicles}</p>
              <p><strong>Total de Serviços:</strong> ${totalServices}</p>
            </div>
            <div class="metric-item">
              <h4>Métricas Filtradas:</h4>
              <p><strong>Agendamentos Filtrados:</strong> ${filteredAppointments.length}</p>
              <p><strong>Receita Estimada:</strong> R$ ${estimatedRevenue.toLocaleString('pt-BR')}</p>
              <p><strong>Total de Colaboradores:</strong> ${totalEmployees}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(reportContent);
      printWindow.document.close();

      // Aguardar o conteúdo carregar antes de mostrar a janela de impressão
      printWindow.onload = () => {
        printWindow.print();
      };
    }

    setDialogOpen(false);
  };

  const handleSavePDF = () => {
    const doc = new jsPDF();
    renderPDFContent(doc);
    doc.save('relatorio_gestao_estetica.pdf');
    setDialogOpen(false);
  };

  const handleExportData = () => {
    const data = {
      clients,
      vehicles,
      services,
      materials,
      appointments: filteredAppointments,
      employees,
      metrics: {
        totalClients,
        totalVehicles,
        estimatedRevenue,
        totalAppointments: filteredAppointments.length
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorios_dados.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios e Métricas</h1>
          <p className="text-muted-foreground">Análise completa do desempenho do negócio</p>
        </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Período:</span>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
            <SelectItem value="365">1 ano</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="date"
          className="ml-4 border rounded px-2 py-1"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="Data Início"
        />
        <input
          type="date"
          className="ml-2 border rounded px-2 py-1"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="Data Fim"
        />
      </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedClient || undefined} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undefined">Todos os Clientes</SelectItem>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>{client.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedService || undefined} onValueChange={setSelectedService}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar Serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undefined">Todos os Serviços</SelectItem>
            {services.map(service => (
              <SelectItem key={service.id} value={service.id}>{service.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedEmployee || undefined} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar Colaborador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undefined">Todos os Colaboradores</SelectItem>
            {employees.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>{employee.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedVehicle || undefined} onValueChange={setSelectedVehicle}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar Veículo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undefined">Todos os Veículos</SelectItem>
            {vehicles.map(vehicle => (
              <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.placa} - {vehicle.marca} {vehicle.modelo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleGeneratePDF}>Gerar Relatório PDF</Button>
        <Button variant="outline" onClick={handleExportData}>Exportar Dados</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos Cadastrados</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {totalClients > 0 ? (totalVehicles / totalClients).toFixed(1) : 0} veículos por cliente
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {estimatedRevenue.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Baseado em serviços concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos filtrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Performance Chart */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Serviços Mais Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointments Status Chart */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Status dos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Receita Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Estoque de Materiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaterials}</div>
            <p className="text-sm text-muted-foreground">Materiais cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Serviços Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-sm text-muted-foreground">Serviços oferecidos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-sm text-muted-foreground">Colaboradores ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualização do Relatório PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-xl font-bold mb-4">Relatório de Gestão Estética</h2>
              <p className="text-sm text-gray-600 mb-4">Data: {new Date().toLocaleDateString('pt-BR')}</p>

              <h3 className="font-semibold mb-2">Filtros Aplicados:</h3>
              <div className="text-sm space-y-1 mb-4">
                {dateFrom && <p>Data Início: {dateFrom}</p>}
                {dateTo && <p>Data Fim: {dateTo}</p>}
                {selectedClient && (
                  <p>Cliente: {clients.find(c => c.id === selectedClient)?.nome}</p>
                )}
                {selectedService && (
                  <p>Serviço: {services.find(s => s.id === selectedService)?.nome}</p>
                )}
                {selectedEmployee && (
                  <p>Colaborador: {employees.find(e => e.id === selectedEmployee)?.nome}</p>
                )}
                {selectedVehicle && (
                  <p>Veículo: {vehicles.find(v => v.id === selectedVehicle)?.placa} - {vehicles.find(v => v.id === selectedVehicle)?.marca} {vehicles.find(v => v.id === selectedVehicle)?.modelo}</p>
                )}
              </div>

              <h3 className="font-semibold mb-2">Agendamentos Filtrados:</h3>
              <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt, index) => (
                    <div key={apt.id} className="border rounded p-2 bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <strong>Cliente:</strong> {apt.clienteNome}
                        </div>
                        <div>
                          <strong>Serviço:</strong> {apt.servicoNome}
                        </div>
                        <div>
                          <strong>Veículo:</strong> {apt.veiculoPlaca}
                        </div>
                        <div>
                          <strong>Colaborador:</strong> {apt.colaboradorNome}
                        </div>
                        <div>
                          <strong>Data:</strong> {apt.data}
                        </div>
                        <div>
                          <strong>Hora:</strong> {apt.hora}
                        </div>
                        <div>
                          <strong>Status:</strong> {apt.status}
                        </div>
                        {apt.observacoes && (
                          <div className="col-span-2">
                            <strong>Observações:</strong> {apt.observacoes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum agendamento encontrado com os filtros aplicados.</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">Métricas:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>Total de Clientes: {totalClients}</p>
                    <p>Total de Veículos: {totalVehicles}</p>
                    <p>Total de Serviços: {totalServices}</p>
                  </div>
                  <div>
                    <p>Agendamentos Filtrados: {filteredAppointments.length}</p>
                    <p>Receita Estimada: R$ {estimatedRevenue.toLocaleString('pt-BR')}</p>
                    <p>Total de Colaboradores: {totalEmployees}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePDF}>
              Baixar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
