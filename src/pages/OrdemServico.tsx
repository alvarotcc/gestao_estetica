import { useState, useEffect } from "react";
import { FileText, Plus, Search, Edit, Trash2, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  colaboradorId: string;
  colaboradorNome: string;
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
}

interface Service {
  id: string;
  nome: string;
  preco: number;
}

interface Material {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
}

interface Collaborator {
  id: string;
  nome: string;
}

export default function OrdemServico() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedServices, setSelectedServices] = useState<OrdemServicoItem[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<OrdemMaterial[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [desconto, setDesconto] = useState(0);

  useEffect(() => {
    // Buscar ordens de serviço
    const ordensCollection = collection(db, "ordens_servico");
    const unsubscribeOrdens = onSnapshot(ordensCollection, (snapshot) => {
      const ordensData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrdemServico[];
      setOrdens(ordensData);
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

    // Buscar serviços
    const servicesCollection = collection(db, "servicos");
    const unsubscribeServices = onSnapshot(servicesCollection, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        preco: doc.data().preco
      })) as Service[];
      setServices(servicesData);
    });

    // Buscar materiais
    const materialsCollection = collection(db, "materiais");
    const unsubscribeMaterials = onSnapshot(materialsCollection, (snapshot) => {
      const materialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Material[];
      setMaterials(materialsData);
    });

    // Buscar colaboradores
    const collaboratorsCollection = collection(db, "colaboradores");
    const unsubscribeCollaborators = onSnapshot(collaboratorsCollection, (snapshot) => {
      const collaboratorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      })) as Collaborator[];
      setCollaborators(collaboratorsData);
    });

    return () => {
      unsubscribeOrdens();
      unsubscribeClients();
      unsubscribeVehicles();
      unsubscribeServices();
      unsubscribeMaterials();
      unsubscribeCollaborators();
    };
  }, []);

  const filteredOrdens = ordens.filter(ordem =>
    ordem.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    setSelectedVehicle("");
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
  };

  const handleAddService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && !selectedServices.find(s => s.servicoId === serviceId)) {
      const newService: OrdemServicoItem = {
        id: `service-${Date.now()}`,
        servicoId: service.id,
        servicoNome: service.nome,
        quantidade: 1,
        valorUnitario: service.preco,
        valorTotal: service.preco
      };
      setSelectedServices([...selectedServices, newService]);
    }
  };

  const handleAddMaterial = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material && !selectedMaterials.find(m => m.materialId === materialId)) {
      const newMaterial: OrdemMaterial = {
        id: `material-${Date.now()}`,
        materialId: material.id,
        materialNome: material.nome,
        quantidade: 1,
        unidade: material.unidade,
        valorUnitario: 0, // Pode ser definido pelo usuário
        valorTotal: 0
      };
      setSelectedMaterials([...selectedMaterials, newMaterial]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
  };

  const calculateTotal = () => {
    const servicesTotal = selectedServices.reduce((total, service) => total + service.valorTotal, 0);
    const materialsTotal = selectedMaterials.reduce((total, material) => total + material.valorTotal, 0);
    const subtotal = servicesTotal + materialsTotal;
    const finalTotal = subtotal - desconto;
    return { subtotal, finalTotal };
  };

  const handleOpenDialog = (ordem: OrdemServico | null = null) => {
    if (ordem) {
      setEditingOrdem(ordem);
      setSelectedClient(ordem.clienteId);
      setSelectedVehicle(ordem.veiculoId);
      setSelectedServices(ordem.servicos);
      setSelectedMaterials(ordem.materiais);
      setObservacoes(ordem.observacoes);
      setDesconto(ordem.desconto);
    } else {
      setEditingOrdem(null);
      setSelectedClient("");
      setSelectedVehicle("");
      setSelectedServices([]);
      setSelectedMaterials([]);
      setObservacoes("");
      setDesconto(0);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingOrdem(null);
    setSelectedClient("");
    setSelectedVehicle("");
    setSelectedServices([]);
    setSelectedMaterials([]);
    setObservacoes("");
    setDesconto(0);
  };

  const handleSaveOrdem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !selectedVehicle || selectedServices.length === 0) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    const vehicle = vehicles.find(v => v.id === selectedVehicle);

    if (!client || !vehicle) {
      alert("Cliente ou veículo não encontrado!");
      return;
    }

    const { finalTotal } = calculateTotal();

    const ordemData: Omit<OrdemServico, 'id'> = {
      numero: editingOrdem ? editingOrdem.numero : `OS-${Date.now()}`,
      clienteId: selectedClient,
      clienteNome: client.nome,
      veiculoId: selectedVehicle,
      veiculoPlaca: vehicle.placa,
      veiculoMarca: vehicle.marca,
      veiculoModelo: vehicle.modelo,
      servicos: selectedServices,
      materiais: selectedMaterials,
      status: "aberta",
      dataAbertura: new Date().toISOString(),
      valorTotal: finalTotal,
      desconto: desconto,
      valorFinal: finalTotal,
      observacoes: observacoes,
      colaboradorId: "", // TODO: Pegar do usuário logado
      colaboradorNome: "" // TODO: Pegar do usuário logado
    };

    try {
      if (editingOrdem) {
        const ordemDoc = doc(db, "ordens_servico", editingOrdem.id);
        await updateDoc(ordemDoc, ordemData);
        console.log("Ordem de serviço atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "ordens_servico"), ordemData);
        console.log("Ordem de serviço criada com sucesso!");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao salvar ordem de serviço:", error);
    }
  };

  const handleDeleteOrdem = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta ordem de serviço?")) {
      try {
        const ordemDoc = doc(db, "ordens_servico", id);
        await deleteDoc(ordemDoc);
        console.log("Ordem de serviço excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir ordem de serviço:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberta: { variant: "default" as const, label: "Aberta", icon: Clock },
      em_andamento: { variant: "secondary" as const, label: "Em Andamento", icon: AlertCircle },
      concluida: { variant: "outline" as const, label: "Concluída", icon: CheckCircle },
      cancelada: { variant: "destructive" as const, label: "Cancelada", icon: AlertCircle }
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie as ordens de serviço dos clientes</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOrdem ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveOrdem} className="space-y-6">
              {/* Cliente e Veículo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Select value={selectedClient} onValueChange={handleClientChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="veiculo">Veículo *</Label>
                  <Select value={selectedVehicle} onValueChange={handleVehicleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles
                        .filter(vehicle => selectedClient === "" || vehicle.clienteId === selectedClient)
                        .map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Serviços */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Serviços *</Label>
                  <Select onValueChange={handleAddService}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Adicionar serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.nome} - R$ {service.preco.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedServices.length > 0 && (
                  <div className="space-y-2">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{service.servicoNome}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {service.valorUnitario.toFixed(2)} x {service.quantidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">R$ {service.valorTotal.toFixed(2)}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Materiais */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Materiais</Label>
                  <Select onValueChange={handleAddMaterial}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Adicionar material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.nome} ({material.unidade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMaterials.length > 0 && (
                  <div className="space-y-2">
                    {selectedMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{material.materialNome}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.quantidade} {material.unidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Valor unitário"
                            value={material.valorUnitario}
                            onChange={(e) => {
                              const valor = parseFloat(e.target.value) || 0;
                              const newMaterials = selectedMaterials.map(m =>
                                m.id === material.id
                                  ? { ...m, valorUnitario: valor, valorTotal: valor * m.quantidade }
                                  : m
                              );
                              setSelectedMaterials(newMaterials);
                            }}
                            className="w-32"
                          />
                          <span className="font-semibold">R$ {material.valorTotal.toFixed(2)}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMaterial(material.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Valores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal</Label>
                  <Input
                    id="subtotal"
                    value={`R$ ${calculateTotal().subtotal.toFixed(2)}`}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto</Label>
                  <Input
                    id="desconto"
                    type="number"
                    step="0.01"
                    value={desconto}
                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total Final</Label>
                  <Input
                    id="total"
                    value={`R$ ${calculateTotal().finalTotal.toFixed(2)}`}
                    readOnly
                    className="font-semibold"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre a ordem de serviço..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingOrdem ? "Salvar Alterações" : "Criar Ordem de Serviço"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por número, cliente ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ordens Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ordens de Serviço ({filteredOrdens.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {ordens.length} OS
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
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
                      {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{getStatusBadge(ordem.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        R$ {ordem.valorFinal.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(ordem)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteOrdem(ordem.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
