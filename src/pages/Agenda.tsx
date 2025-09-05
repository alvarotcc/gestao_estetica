import { useState, useEffect } from "react";
import { Calendar, Plus, Search, Edit, Trash2, Clock, User, Car } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

interface Appointment {
  id: string;
  clienteId: string;
  veiculoId: string;
  servicoId: string;
  colaboradorId: string;
  data: string;
  hora: string;
  status: "agendado" | "em_andamento" | "concluido" | "cancelado";
  observacoes: string;
}

interface Client {
  id: string;
  nome: string;
}

interface Vehicle {
  id: string;
  placa: string;
}

interface Service {
  id: string;
  nome: string;
}

interface Collaborator {
  id: string;
  nome: string;
}

const initialAppointmentState = {
  clienteId: "",
  veiculoId: "",
  servicoId: "",
  colaboradorId: "",
  data: "",
  hora: "",
  status: "agendado" as const,
  observacoes: ""
};

export default function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState(initialAppointmentState);

  useEffect(() => {
    // Buscar agendamentos
    const appointmentsCollection = collection(db, "agendamentos");
    const unsubscribeAppointments = onSnapshot(appointmentsCollection, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
    }, (error) => {
      console.error("Erro ao buscar agendamentos: ", error);
    });

    // Buscar clientes
    const clientsCollection = collection(db, "clientes");
    const unsubscribeClients = onSnapshot(clientsCollection, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      })) as Client[];
      setClients(clientsData);
    }, (error) => {
      console.error("Erro ao buscar clientes: ", error);
    });

    // Buscar veículos
    const vehiclesCollection = collection(db, "veiculos");
    const unsubscribeVehicles = onSnapshot(vehiclesCollection, (snapshot) => {
      const vehiclesData = snapshot.docs.map(doc => ({
        id: doc.id,
        placa: doc.data().placa
      })) as Vehicle[];
      setVehicles(vehiclesData);
    }, (error) => {
      console.error("Erro ao buscar veículos: ", error);
    });

    // Buscar serviços
    const servicesCollection = collection(db, "servicos");
    const unsubscribeServices = onSnapshot(servicesCollection, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      })) as Service[];
      setServices(servicesData);
    }, (error) => {
      console.error("Erro ao buscar serviços: ", error);
    });

    // Buscar colaboradores
    const collaboratorsCollection = collection(db, "colaboradores");
    const unsubscribeCollaborators = onSnapshot(collaboratorsCollection, (snapshot) => {
      const collaboratorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      })) as Collaborator[];
      setCollaborators(collaboratorsData);
    }, (error) => {
      console.error("Erro ao buscar colaboradores: ", error);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeClients();
      unsubscribeVehicles();
      unsubscribeServices();
      unsubscribeCollaborators();
    };
  }, []);

  // Funções auxiliares para obter nomes a partir dos IDs
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nome : clientId;
  };

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.placa : vehicleId;
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.nome : serviceId;
  };

  const getCollaboratorName = (collaboratorId: string) => {
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    return collaborator ? collaborator.nome : collaboratorId;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const clientName = getClientName(appointment.clienteId);
    const vehiclePlate = getVehiclePlate(appointment.veiculoId);
    const serviceName = getServiceName(appointment.servicoId);
    return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
           serviceName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (editingAppointment) {
      setEditingAppointment(prev => prev ? { ...prev, [id]: value } : null);
    } else {
      setNewAppointment({ ...newAppointment, [id]: value });
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    if (editingAppointment) {
      setEditingAppointment(prev => prev ? { ...prev, [field]: value } : null);
    } else {
      setNewAppointment({ ...newAppointment, [field]: value });
    }
  };

  const handleOpenDialog = (appointment: Appointment | null = null) => {
    if (appointment) {
      setEditingAppointment(appointment);
    } else {
      setNewAppointment(initialAppointmentState);
      setEditingAppointment(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewAppointment(initialAppointmentState);
    setEditingAppointment(null);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppointment) {
      try {
        const appointmentDoc = doc(db, "agendamentos", editingAppointment.id);
        const { id, ...appointmentData } = editingAppointment;
        await updateDoc(appointmentDoc, appointmentData);
        console.log("Agendamento atualizado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
      }
    } else {
      try {
        await addDoc(collection(db, "agendamentos"), newAppointment);
        console.log("Agendamento criado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao criar agendamento:", error);
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        const appointmentDoc = doc(db, "agendamentos", id);
        await deleteDoc(appointmentDoc);
        console.log("Agendamento excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      agendado: { variant: "default" as const, label: "Agendado" },
      em_andamento: { variant: "secondary" as const, label: "Em Andamento" },
      concluido: { variant: "outline" as const, label: "Concluído" },
      cancelado: { variant: "destructive" as const, label: "Cancelado" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.agendado;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda de Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos de serviços</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? "Editar Agendamento" : "Cadastrar Novo Agendamento"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clienteId">Cliente *</Label>
                  <Select
                    value={editingAppointment?.clienteId || newAppointment.clienteId}
                    onValueChange={(value) => handleSelectChange("clienteId", value)}
                    required
                  >
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
                  <Label htmlFor="veiculoId">Veículo *</Label>
                  <Select
                    value={editingAppointment?.veiculoId || newAppointment.veiculoId}
                    onValueChange={(value) => handleSelectChange("veiculoId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.placa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicoId">Serviço *</Label>
                  <Select
                    value={editingAppointment?.servicoId || newAppointment.servicoId}
                    onValueChange={(value) => handleSelectChange("servicoId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colaboradorId">Colaborador *</Label>
                  <Select
                    value={editingAppointment?.colaboradorId || newAppointment.colaboradorId}
                    onValueChange={(value) => handleSelectChange("colaboradorId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.map((collaborator) => (
                        <SelectItem key={collaborator.id} value={collaborator.id}>
                          {collaborator.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    value={editingAppointment?.data || newAppointment.data}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Horário *</Label>
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    value={editingAppointment?.hora || newAppointment.hora}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingAppointment?.status || newAppointment.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={editingAppointment?.observacoes || newAppointment.observacoes}
                  onChange={handleInputChange}
                  placeholder="Observações adicionais sobre o agendamento"
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                />
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingAppointment ? "Salvar Alterações" : "Criar Agendamento"}
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
              placeholder="Buscar por cliente, placa ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Agendamentos ({filteredAppointments.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {appointments.length} agendamentos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(appointment.data).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.hora}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{getClientName(appointment.clienteId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span>{getVehiclePlate(appointment.veiculoId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getServiceName(appointment.servicoId)}</TableCell>
                    <TableCell>{getCollaboratorName(appointment.colaboradorId)}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(appointment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAppointment(appointment.id)}>
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
