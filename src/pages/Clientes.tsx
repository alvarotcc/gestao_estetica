// src/pages/Clientes.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Eye, Edit, Trash2, Gift, Phone, Mail, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Importe a conexão com o Firebase
import { useAuth } from "@/contexts/AuthContext";

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

const initialClientState = {
  nome: "",
  telefone: "",
  email: "",
  cpfCnpj: "",
  aniversario: "",
  observacoes: "",
  veiculos: 0,
  servicos: 0
};

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState(initialClientState);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    const clientsCollection = collection(db, "clientes");
    const unsubscribe = onSnapshot(clientsCollection, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      setClients(clientsData);
    }, (error) => {
      console.error("Erro ao buscar clientes: ", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (editingClient) {
      setEditingClient(prev => prev ? { ...prev, [id]: value } : null);
    } else {
      setNewClient({ ...newClient, [id]: value });
    }
  };

  const handleOpenDialog = (client: Client | null = null) => {
    if (client) {
      setEditingClient(client);
    } else {
      setNewClient(initialClientState);
      setEditingClient(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewClient(initialClientState);
    setEditingClient(null);
  };

  // ...existing code...
const handleSaveClient = async (e: React.FormEvent) => {
  e.preventDefault();
  if (editingClient) {
    try {
      const clientDoc = doc(db, "clientes", editingClient.id);
      const { id, ...clientData } = editingClient; // Remover o id
      await updateDoc(clientDoc, clientData);
      console.log("Cliente atualizado com sucesso!");
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
    }
  } else {
    try {
      const clientData = {
        ...newClient,
        createdBy: userData?.uid,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "clientes"), clientData);
      console.log("Cliente adicionado com sucesso!");
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
    }
  }
};
// ...existing code...

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const clientDoc = doc(db, "clientes", id);
        await deleteDoc(clientDoc);
        console.log("Cliente excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Cadastre e gerencie seus clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSaveClient} className="space-y-4 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" value={editingClient?.nome || newClient.nome} onChange={handleInputChange} placeholder="Nome completo do cliente" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input id="telefone" value={editingClient?.telefone || newClient.telefone} onChange={handleInputChange} placeholder="(11) 99999-9999" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={editingClient?.email || newClient.email} onChange={handleInputChange} placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input id="cpfCnpj" value={editingClient?.cpfCnpj || newClient.cpfCnpj} onChange={handleInputChange} placeholder="000.000.000-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aniversario">Data de Aniversário</Label>
                  <Input id="aniversario" type="date" value={editingClient?.aniversario || newClient.aniversario} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={editingClient?.observacoes || newClient.observacoes} onChange={handleInputChange} placeholder="Informações adicionais sobre o cliente" />
              </div>
              <DialogFooter className="mt-4 flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
                </Button>
              </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Clientes ({filteredClients.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {clients.length} clientes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Aniversário</TableHead>
                  <TableHead>Veículos</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.nome}</div>
                        {client.observacoes && (
                          <div className="text-sm text-muted-foreground">{client.observacoes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" />
                          {client.telefone}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {client.aniversario ? new Date(client.aniversario).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                        {client.aniversario && new Date(client.aniversario).getMonth() === new Date().getMonth() && (
                          <Gift className="w-4 h-4 text-accent" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.veiculos} veículo(s)</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client.servicos} serviços</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(client)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClient(client.id)}>
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
