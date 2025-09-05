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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

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

  // Receita estimada baseada nos serviços agendados
  const estimatedRevenue = appointments
    .filter(apt => apt.status === "concluido")
    .reduce((total, apt) => {
      const service = services.find(s => s.nome === apt.servicoNome);
      return total + (service?.preco || 0);
    }, 0);

  // Dados para gráfico de serviços mais realizados
  const servicesChartData = services.map(service => {
    const count = appointments.filter(apt => apt.servicoNome === service.nome).length;
    return {
      name: service.nome,
      value: count,
      revenue: count * service.preco
    };
  }).filter(item => item.value > 0);

  // Dados para gráfico de status dos agendamentos
  const statusChartData = [
    { name: "Agendado", value: appointments.filter(apt => apt.status === "agendado").length, color: "#8884d8" },
    { name: "Em Andamento", value: appointments.filter(apt => apt.status === "em_andamento").length, color: "#82ca9d" },
    { name: "Concluído", value: appointments.filter(apt => apt.status === "concluido").length, color: "#ffc658" },
    { name: "Cancelado", value: appointments.filter(apt => apt.status === "cancelado").length, color: "#ff7c7c" }
  ].filter(item => item.value > 0);

  // Dados para gráfico de receita mensal (simulado)
  const revenueChartData = [
    { month: "Jan", revenue: 12500 },
    { month: "Fev", revenue: 15200 },
    { month: "Mar", revenue: 18300 },
    { month: "Abr", revenue: 16800 },
    { month: "Mai", revenue: 22100 },
    { month: "Jun", revenue: 19800 }
  ];

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
        </div>
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
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Total de agendamentos realizados
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']} />
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
    </div>
  );
}
