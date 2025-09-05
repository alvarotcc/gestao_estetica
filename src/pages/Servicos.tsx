// src/pages/Servicos.tsx
import { useState, useEffect } from "react";
import { Wrench, Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Service {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
}

export default function Servicos() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    nome: "",
    descricao: "",
    preco: 0
  });

  useEffect(() => {
    const servicesCollection = collection(db, "servicos");
    const unsubscribe = onSnapshot(servicesCollection, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);
    }, (error) => {
      console.error("Erro ao buscar serviços: ", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredServices = services.filter(service =>
    service.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingService) {
      setEditingService(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewService({ ...newService, [name]: value });
    }
  };

  const handleOpenDialog = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);
    } else {
      setNewService({
        nome: "",
        descricao: "",
        preco: 0
      });
      setEditingService(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewService({
      nome: "",
      descricao: "",
      preco: 0
    });
    setEditingService(null);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      try {
        const serviceDoc = doc(db, "servicos", editingService.id);
        const { id, ...serviceData } = editingService;
        await updateDoc(serviceDoc, serviceData);
        console.log("Serviço atualizado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao atualizar serviço:", error);
      }
    } else {
      try {
        await addDoc(collection(db, "servicos"), newService);
        console.log("Serviço adicionado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao adicionar serviço:", error);
      }
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        const serviceDoc = doc(db, "servicos", id);
        await deleteDoc(serviceDoc);
        console.log("Serviço excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Serviço" : "Cadastrar Novo Serviço"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSaveService} className="space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Serviço *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={editingService?.nome || newService.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Lavagem Completa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={editingService?.descricao || newService.descricao}
                  onChange={handleInputChange}
                  placeholder="Descrição detalhada do serviço"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  name="preco"
                  type="number"
                  step="0.01"
                  value={editingService?.preco || newService.preco}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <DialogFooter className="mt-4 flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingService ? "Salvar Alterações" : "Cadastrar Serviço"}
                </Button>
              </DialogFooter>
              </form>
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
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Serviços ({filteredServices.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {services.length} serviços
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{service.nome}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{service.descricao}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.preco)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(service)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteService(service.id)}>
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
