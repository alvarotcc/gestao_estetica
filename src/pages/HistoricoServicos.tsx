import { useState, useEffect } from "react";
import { History, Search, Car, User, Calendar, Wrench, DollarSign, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  veiculoId: string;
  veiculoPlaca: string;
  veiculoMarca: string;
  veiculoModelo: string;
  servicos: OrdemServicoItem[];
  materiais: OrdemMaterial[];
  status: "aberta" | "em_andamento" | "concluida" | "cancelada";
  dataAbertura: string;
  dataConclusao?: string;
  valorTotal: number;
  desconto: number;
  valorFinal: number;
  observacoes: string;
}

interface OrdemServicoItem {
  id: string;
  servicoId: string;
  servicoNome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface OrdemMaterial {
  id: string;
  materialId: string;
  materialNome: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
}

interface Client {
  id: string;
  nome: string;
}

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  clienteId: string;
  clienteNome: string;
}

export default function HistoricoServicos() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [activeTab, setActiveTab] = useState("veiculos");

  useEffect(() => {
    // Buscar ordens de serviço concluídas
    const ordensCollection = collection(db, "ordens_servico");
    const ordensQuery = query(ordensCollection, orderBy("dataConclusao", "desc"));
    const unsubscribeOrdens = onSnapshot(ordensQuery, (snapshot) => {
      const ordensData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrdemServico[];
      // Filtrar apenas ordens concluídas no lado do cliente
      const ordensConcluidas = ordensData.filter(ordem => ordem.status === "concluida");
      setOrdens(ordensConcluidas);
    });

    // Buscar clientes
    const clientsCollection = collection(db, "clientes");
    const unsubscribeClients = onSnapshot(clientsCollection, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      })) as Client[];
      setClients(clientsData);
    });

    // Buscar veículos
    const vehiclesCollection = collection(db, "veiculos");
    const unsubscribeVehicles = onSnapshot(vehiclesCollection, (snapshot) => {
      const vehiclesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehiclesData);
    });

    return () => {
      unsubscribeOrdens();
      unsubscribeClients();
      unsubscribeVehicles();
    };
  }, []);

  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch = searchTerm === "" ||
      ordem.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.veiculoMarca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.veiculoModelo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClient = selectedClient === "" || selectedClient === "all" || ordem.clienteId === selectedClient;
    const matchesVehicle = selectedVehicle === "" || selectedVehicle === "all" || ordem.veiculoId === selectedVehicle;

    return matchesSearch && matchesClient && matchesVehicle;
  });

  const getClientVehicles = (clientId: string) => {
    return vehicles.filter(vehicle => vehicle.clienteId === clientId);
  };

  const getVehicleHistory = (vehicleId: string) => {
    return ordens.filter(ordem => ordem.veiculoId === vehicleId);
  };

  const getClientHistory = (clientId: string) => {
    return ordens.filter(ordem => ordem.clienteId === clientId);
  };

  const calculateTotalSpent = (ordensList: OrdemServico[]) => {
    return ordensList.reduce((total, ordem) => total + ordem.valorFinal, 0);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberta: { variant: "default" as const, label: "Aberta", icon: Calendar },
      em_andamento: { variant: "secondary" as const, label: "Em Andamento", icon: Wrench },
      concluida: { variant: "outline" as const, label: "Concluída", icon: FileText },
      cancelada: { variant: "destructive" as const, label: "Cancelada", icon: FileText }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberta;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const VehicleHistoryCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const vehicleOrdens = getVehicleHistory(vehicle.id);
    const totalSpent = calculateTotalSpent(vehicleOrdens);

    return (
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{vehicle.marca} {vehicle.modelo}</p>
                <p className="text-sm text-muted-foreground">{vehicle.placa}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className="font-semibold text-lg">R$ {totalSpent.toLocaleString('pt-BR')}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vehicleOrdens.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum serviço realizado neste veículo</p>
            ) : (
              vehicleOrdens.map((ordem) => (
                <div key={ordem.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{ordem.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ordem.dataConclusao || ordem.dataAbertura).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {ordem.valorFinal.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-muted-foreground">{ordem.servicos.length} serviços</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ClientHistoryCard = ({ client }: { client: Client }) => {
    const clientOrdens = getClientHistory(client.id);
    const clientVehicles = getClientVehicles(client.id);
    const totalSpent = calculateTotalSpent(clientOrdens);

    return (
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{client.nome}</p>
                <p className="text-sm text-muted-foreground">{clientVehicles.length} veículo(s)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className="font-semibold text-lg">R$ {totalSpent.toLocaleString('pt-BR')}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientVehicles.map((vehicle) => (
              <div key={vehicle.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{vehicle.marca} {vehicle.modelo} - {vehicle.placa}</span>
                </div>
                <div className="space-y-2">
                  {getVehicleHistory(vehicle.id).map((ordem) => (
                    <div key={ordem.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{ordem.numero}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(ordem.dataConclusao || ordem.dataAbertura).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <span className="font-semibold">R$ {ordem.valorFinal.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {clientVehicles.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Nenhum veículo cadastrado para este cliente</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico de Serviços</h1>
          <p className="text-muted-foreground">Acompanhe o histórico de serviços por veículo e cliente</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrdens.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {calculateTotalSpent(filteredOrdens).toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredOrdens.map(o => o.clienteId)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por OS, cliente ou veículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Veículo</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os veículos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os veículos</SelectItem>
                  {vehicles
                    .filter(vehicle => selectedClient === "" || selectedClient === "all" || vehicle.clienteId === selectedClient)
                    .map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedClient("");
                  setSelectedVehicle("");
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="veiculos">Por Veículo</TabsTrigger>
          <TabsTrigger value="clientes">Por Cliente</TabsTrigger>
          <TabsTrigger value="tabela">Tabela Completa</TabsTrigger>
        </TabsList>

        <TabsContent value="veiculos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehicles
              .filter(vehicle => selectedClient === "" || selectedClient === "all" || vehicle.clienteId === selectedClient)
              .map((vehicle) => (
                <VehicleHistoryCard key={vehicle.id} vehicle={vehicle} />
              ))}
          </div>
          {vehicles.length === 0 && (
            <Card className="border-0 shadow-card">
              <CardContent className="p-8 text-center">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clients.map((client) => (
              <ClientHistoryCard key={client.id} client={client} />
            ))}
          </div>
          {clients.length === 0 && (
            <Card className="border-0 shadow-card">
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tabela">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Histórico Completo de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Serviços</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrdens.map((ordem) => (
                      <TableRow key={ordem.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{ordem.numero}</div>
                        </TableCell>
                        <TableCell>{ordem.clienteNome}</TableCell>
                        <TableCell>
                          <div className="font-medium">{ordem.veiculoPlaca}</div>
                          <div className="text-sm text-muted-foreground">
                            {ordem.veiculoMarca} {ordem.veiculoModelo}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(ordem.dataConclusao || ordem.dataAbertura).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {ordem.servicos.length} serviço(s)
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            R$ {ordem.valorFinal.toLocaleString('pt-BR')}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(ordem.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
