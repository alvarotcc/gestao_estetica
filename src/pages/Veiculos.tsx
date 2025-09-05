// src/pages/Veiculos.tsx
import { useState, useEffect } from "react";
import { Car, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
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
import { MainLayout } from "@/components/layout/MainLayout";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  clienteId: string;
  clienteNome?: string;
  ano?: string;
  cor?: string;
  quilometragem?: number;
  combustivel?: string;
}

interface Client {
  id: string;
  nome: string;
}

export default function Veiculos() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    marca: "",
    modelo: "",
    placa: "",
    clienteId: "",
    ano: "",
    cor: "",
    quilometragem: 0,
    combustivel: ""
  });

  useEffect(() => {
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
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehiclesData);
    }, (error) => {
      console.error("Erro ao buscar veículos: ", error);
    });

    return () => {
      unsubscribeClients();
      unsubscribeVehicles();
    };
  }, []);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingVehicle) {
      setEditingVehicle(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewVehicle({ ...newVehicle, [name]: value });
    }
  };

  const handleClientChange = (value: string) => {
    if (editingVehicle) {
      setEditingVehicle(prev => prev ? { ...prev, clienteId: value } : null);
    } else {
      setNewVehicle({ ...newVehicle, clienteId: value });
    }
  };

  const handleOpenDialog = (vehicle: Vehicle | null = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
    } else {
      setNewVehicle({
        marca: "",
        modelo: "",
        placa: "",
        clienteId: "",
        ano: "",
        cor: "",
        quilometragem: 0,
        combustivel: ""
      });
      setEditingVehicle(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewVehicle({
      marca: "",
      modelo: "",
      placa: "",
      clienteId: "",
      ano: "",
      cor: "",
      quilometragem: 0,
      combustivel: ""
    });
    setEditingVehicle(null);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      try {
        const vehicleDoc = doc(db, "veiculos", editingVehicle.id);
        const { id, ...vehicleData } = editingVehicle;
        await updateDoc(vehicleDoc, vehicleData);
        console.log("Veículo atualizado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao atualizar veículo:", error);
      }
    } else {
      try {
        await addDoc(collection(db, "veiculos"), newVehicle);
        console.log("Veículo adicionado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao adicionar veículo:", error);
      }
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      try {
        const vehicleDoc = doc(db, "veiculos", id);
        await deleteDoc(vehicleDoc);
        console.log("Veículo excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir veículo:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Veículos</h1>
          <p className="text-muted-foreground">Cadastre e gerencie os veículos de seus clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Editar Veículo" : "Cadastrar Novo Veículo"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSaveVehicle} className="space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente *</Label>
                <Select
                  value={editingVehicle?.clienteId || newVehicle.clienteId}
                  onValueChange={handleClientChange}
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
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  name="marca"
                  value={editingVehicle?.marca || newVehicle.marca}
                  onChange={handleInputChange}
                  placeholder="Ex: Toyota, Honda, Ford"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  name="modelo"
                  value={editingVehicle?.modelo || newVehicle.modelo}
                  onChange={handleInputChange}
                  placeholder="Ex: Corolla, Civic, Focus"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  name="placa"
                  value={editingVehicle?.placa || newVehicle.placa}
                  onChange={handleInputChange}
                  placeholder="Ex: ABC-1234"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  name="ano"
                  value={editingVehicle?.ano || newVehicle.ano}
                  onChange={handleInputChange}
                  placeholder="Ex: 2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  name="cor"
                  value={editingVehicle?.cor || newVehicle.cor}
                  onChange={handleInputChange}
                  placeholder="Ex: Preto, Branco, Vermelho"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quilometragem">Quilometragem</Label>
                <Input
                  id="quilometragem"
                  name="quilometragem"
                  type="number"
                  value={editingVehicle?.quilometragem || newVehicle.quilometragem}
                  onChange={handleInputChange}
                  placeholder="Ex: 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="combustivel">Combustível</Label>
                <Input
                  id="combustivel"
                  name="combustivel"
                  value={editingVehicle?.combustivel || newVehicle.combustivel}
                  onChange={handleInputChange}
                  placeholder="Ex: Gasolina, Diesel, Flex"
                />
              </div>
              </form>
            </div>
            <DialogFooter className="mt-4 flex-shrink-0">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {editingVehicle ? "Salvar Alterações" : "Cadastrar Veículo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por marca, modelo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Veículos ({filteredVehicles.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {vehicles.length} veículos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Quilometragem</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => {
                  const client = clients.find(c => c.id === vehicle.clienteId);
                  return (
                    <TableRow key={vehicle.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{client ? client.nome : vehicle.clienteId}</div>
                      </TableCell>
                      <TableCell>{vehicle.marca}</TableCell>
                      <TableCell>{vehicle.modelo}</TableCell>
                      <TableCell>{vehicle.placa}</TableCell>
                      <TableCell>{vehicle.ano || "-"}</TableCell>
                      <TableCell>{vehicle.cor || "-"}</TableCell>
                      <TableCell>{vehicle.quilometragem ? vehicle.quilometragem.toLocaleString() + " km" : "-"}</TableCell>
                      <TableCell>{vehicle.combustivel || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleOpenDialog(vehicle)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteVehicle(vehicle.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
