// src/pages/Checklist.tsx
import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle, Minus, Plus, Search, Eye, Edit, Trash2, Save, FileText } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  clienteId: string;
  clienteNome?: string;
}

interface Client {
  id: string;
  nome: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'ok' | 'attention' | 'critical' | 'na';
  notes?: string;
}

interface Checklist {
  id: string;
  vehicleId: string;
  vehiclePlaca: string;
  vehicleMarca: string;
  vehicleModelo: string;
  clientId: string;
  clientNome: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed';
  notes?: string;
}

const checklistCategories = [
  {
    id: 'exterior',
    name: 'Exterior',
    items: [
      'Faróis dianteiros',
      'Lanternas traseiras',
      'Setas e luzes de freio',
      'Limpadores de para-brisa',
      'Espelhos retrovisores',
      'Para-choques',
      'Lataria e pintura',
      'Vidros',
      'Pneus (estado geral)',
      'Estepe',
      'Calotas',
      'Antena'
    ]
  },
  {
    id: 'interior',
    name: 'Interior',
    items: [
      'Painel de instrumentos',
      'Bancos',
      'Cintos de segurança',
      'Tapetes',
      'Teto interno',
      'Portas e maçanetas',
      'Sistema de som',
      'Ar-condicionado',
      'Vidros elétricos',
      'Travas elétricas'
    ]
  },
  {
    id: 'engine',
    name: 'Motor',
    items: [
      'Nível de óleo',
      'Filtro de óleo',
      'Filtro de ar',
      'Filtro de combustível',
      'Correias',
      'Mangueiras',
      'Bateria',
      'Velas de ignição',
      'Sistema de freios',
      'Suspensão'
    ]
  },
  {
    id: 'under_vehicle',
    name: 'Parte Inferior',
    items: [
      'Escapamento',
      'Sistema de freios',
      'Suspensão',
      'Direção',
      'Transmissão',
      'Diferencial',
      'Óleo de freio',
      'Fluido de direção'
    ]
  },
  {
    id: 'documentation',
    name: 'Documentação',
    items: [
      'CRLV (Documento do veículo)',
      'Seguro obrigatório',
      'Seguro adicional',
      'Manual do proprietário',
      'Comprovante de revisão',
      'Certificado de emissão'
    ]
  }
];

export default function Checklist() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentChecklist, setCurrentChecklist] = useState<Checklist | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklistNotes, setChecklistNotes] = useState("");

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

    // Buscar checklists
    const checklistsCollection = collection(db, "checklists");
    const unsubscribeChecklists = onSnapshot(checklistsCollection, (snapshot) => {
      const checklistsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Checklist[];
      setChecklists(checklistsData);
    }, (error) => {
      console.error("Erro ao buscar checklists: ", error);
    });

    return () => {
      unsubscribeClients();
      unsubscribeVehicles();
      unsubscribeChecklists();
    };
  }, []);

  const filteredChecklists = checklists.filter(checklist =>
    checklist.vehiclePlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.vehicleMarca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.vehicleModelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.clientNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initializeChecklistItems = () => {
    const items: ChecklistItem[] = [];
    checklistCategories.forEach(category => {
      category.items.forEach(item => {
        items.push({
          id: `${category.id}-${item.replace(/\s+/g, '-').toLowerCase()}`,
          category: category.name,
          item: item,
          status: 'na',
          notes: ''
        });
      });
    });
    return items;
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setChecklistItems(initializeChecklistItems());
      setChecklistNotes("");
    }
  };

  const handleItemStatusChange = (itemId: string, status: 'ok' | 'attention' | 'critical' | 'na') => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status } : item
      )
    );
  };

  const handleItemNotesChange = (itemId: string, notes: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const handleSaveChecklist = async () => {
    console.log("Iniciando salvamento do checklist...");
    console.log("Veículo selecionado:", selectedVehicle);
    console.log("Items do checklist:", checklistItems);

    if (!selectedVehicle) {
      console.error("Nenhum veículo selecionado!");
      return;
    }

    const client = clients.find(c => c.id === selectedVehicle.clienteId);
    console.log("Cliente encontrado:", client);

    if (!client) {
      console.error("Cliente não encontrado para o veículo selecionado!");
      return;
    }

    const checklistData: Omit<Checklist, 'id'> = {
      vehicleId: selectedVehicle.id,
      vehiclePlaca: selectedVehicle.placa,
      vehicleMarca: selectedVehicle.marca,
      vehicleModelo: selectedVehicle.modelo,
      clientId: client.id,
      clientNome: client.nome,
      items: checklistItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
      notes: checklistNotes
    };

    console.log("Dados do checklist a serem salvos:", checklistData);

    try {
      if (currentChecklist) {
        // Atualizar checklist existente
        console.log("Atualizando checklist existente:", currentChecklist.id);
        const checklistDoc = doc(db, "checklists", currentChecklist.id);
        await updateDoc(checklistDoc, {
          ...checklistData,
          updatedAt: new Date().toISOString()
        });
        console.log("Checklist atualizado com sucesso!");
      } else {
        // Criar novo checklist
        console.log("Criando novo checklist...");
        const docRef = await addDoc(collection(db, "checklists"), checklistData);
        console.log("Checklist criado com sucesso! ID:", docRef.id);
      }

      setIsDialogOpen(false);
      setSelectedVehicle(null);
      setChecklistItems([]);
      setChecklistNotes("");
      setCurrentChecklist(null);
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      console.error("Detalhes do erro:", error.message);
      console.error("Stack trace:", error.stack);
    }
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setCurrentChecklist(checklist);
    setSelectedVehicle(vehicles.find(v => v.id === checklist.vehicleId) || null);
    setChecklistItems(checklist.items);
    setChecklistNotes(checklist.notes || "");
    setIsDialogOpen(true);
  };

  const handleDeleteChecklist = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este checklist?")) {
      try {
        const checklistDoc = doc(db, "checklists", id);
        await deleteDoc(checklistDoc);
        console.log("Checklist excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir checklist:", error);
      }
    }
  };

  const handleNewChecklist = () => {
    setCurrentChecklist(null);
    setSelectedVehicle(null);
    setChecklistItems(initializeChecklistItems());
    setChecklistNotes("");
    setIsDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'attention':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
      case 'attention':
        return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const getChecklistSummary = (items: ChecklistItem[]) => {
    const summary = {
      ok: items.filter(item => item.status === 'ok').length,
      attention: items.filter(item => item.status === 'attention').length,
      critical: items.filter(item => item.status === 'critical').length,
      na: items.filter(item => item.status === 'na').length
    };
    return summary;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checklist de Veículos</h1>
          <p className="text-muted-foreground">Realize inspeções completas dos veículos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all" onClick={handleNewChecklist}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Checklist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentChecklist ? "Editar Checklist" : "Novo Checklist de Inspeção"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Vehicle Selection */}
              {!currentChecklist && (
                <div className="space-y-2">
                  <Label htmlFor="vehicleSelect">Selecione o Veículo *</Label>
                  <Select
                    value={selectedVehicle?.id || ""}
                    onValueChange={handleVehicleSelect}
                    disabled={!!currentChecklist}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => {
                        const client = clients.find(c => c.id === vehicle.clienteId);
                        return (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.placa} - {vehicle.marca} {vehicle.modelo} ({client?.nome || 'Cliente não encontrado'})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedVehicle && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold">Veículo Selecionado:</h3>
                  <p>{selectedVehicle.placa} - {selectedVehicle.marca} {selectedVehicle.modelo}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {clients.find(c => c.id === selectedVehicle.clienteId)?.nome}
                  </p>
                </div>
              )}

              {/* Checklist Tabs */}
              {selectedVehicle && (
                <Tabs defaultValue="exterior" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="exterior">Exterior</TabsTrigger>
                    <TabsTrigger value="interior">Interior</TabsTrigger>
                    <TabsTrigger value="engine">Motor</TabsTrigger>
                    <TabsTrigger value="under_vehicle">Parte Inf.</TabsTrigger>
                    <TabsTrigger value="documentation">Documentos</TabsTrigger>
                  </TabsList>

                  {checklistCategories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="space-y-4">
                      <div className="grid gap-4">
                        {category.items.map((item) => {
                          const checklistItem = checklistItems.find(
                            ci => ci.category === category.name && ci.item === item
                          );
                          return (
                            <Card key={item} className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{item}</h4>
                                <div className="flex gap-2">
                                  {['ok', 'attention', 'critical', 'na'].map((status) => (
                                    <Button
                                      key={status}
                                      size="sm"
                                      variant={checklistItem?.status === status ? "default" : "outline"}
                                      onClick={() => handleItemStatusChange(
                                        checklistItem?.id || `${category.id}-${item.replace(/\s+/g, '-').toLowerCase()}`,
                                        status as any
                                      )}
                                    >
                                      {status === 'ok' && <CheckCircle className="w-4 h-4" />}
                                      {status === 'attention' && <AlertTriangle className="w-4 h-4" />}
                                      {status === 'critical' && <XCircle className="w-4 h-4" />}
                                      {status === 'na' && <Minus className="w-4 h-4" />}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <Textarea
                                placeholder="Observações (opcional)"
                                value={checklistItem?.notes || ""}
                                onChange={(e) => handleItemNotesChange(
                                  checklistItem?.id || `${category.id}-${item.replace(/\s+/g, '-').toLowerCase()}`,
                                  e.target.value
                                )}
                                className="mt-2"
                              />
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}

              {/* General Notes */}
              {selectedVehicle && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações Gerais</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações gerais sobre o veículo..."
                    value={checklistNotes}
                    onChange={(e) => setChecklistNotes(e.target.value)}
                  />
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="bg-gradient-primary"
                  onClick={handleSaveChecklist}
                  disabled={!selectedVehicle}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {currentChecklist ? "Atualizar Checklist" : "Salvar Checklist"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por placa, marca, modelo ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklists Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Checklists Realizados ({filteredChecklists.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {checklists.length} checklists
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resumo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChecklists.map((checklist) => {
                  const summary = getChecklistSummary(checklist.items);
                  return (
                    <TableRow key={checklist.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{checklist.vehiclePlaca}</div>
                        <div className="text-sm text-muted-foreground">
                          {checklist.vehicleMarca} {checklist.vehicleModelo}
                        </div>
                      </TableCell>
                      <TableCell>{checklist.clientNome}</TableCell>
                      <TableCell>
                        {new Date(checklist.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={checklist.status === 'completed' ? 'default' : 'secondary'}>
                          {checklist.status === 'completed' ? 'Concluído' : 'Rascunho'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {summary.ok > 0 && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              {summary.ok} OK
                            </Badge>
                          )}
                          {summary.attention > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              {summary.attention} Atenção
                            </Badge>
                          )}
                          {summary.critical > 0 && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {summary.critical} Crítico
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditChecklist(checklist)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteChecklist(checklist.id)}>
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
