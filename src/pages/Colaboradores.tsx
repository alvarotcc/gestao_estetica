// src/pages/Colaboradores.tsx
import { useState, useEffect } from "react";
import { User, Plus, Search, Edit, Trash2 } from "lucide-react";
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

interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
}

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [newColaborador, setNewColaborador] = useState({
    nome: "",
    cargo: "",
    telefone: "",
    email: ""
  });

  useEffect(() => {
    const colaboradoresCollection = collection(db, "colaboradores");
    const unsubscribe = onSnapshot(colaboradoresCollection, (snapshot) => {
      const colaboradoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Colaborador[];
      setColaboradores(colaboradoresData);
    }, (error) => {
      console.error("Erro ao buscar colaboradores: ", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredColaboradores = colaboradores.filter(colaborador =>
    colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colaborador.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colaborador.telefone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colaborador.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingColaborador) {
      setEditingColaborador(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewColaborador({ ...newColaborador, [name]: value });
    }
  };

  const handleOpenDialog = (colaborador: Colaborador | null = null) => {
    if (colaborador) {
      setEditingColaborador(colaborador);
    } else {
      setNewColaborador({
        nome: "",
        cargo: "",
        telefone: "",
        email: ""
      });
      setEditingColaborador(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewColaborador({
      nome: "",
      cargo: "",
      telefone: "",
      email: ""
    });
    setEditingColaborador(null);
  };

  const handleSaveColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingColaborador) {
      try {
        const colaboradorDoc = doc(db, "colaboradores", editingColaborador.id);
        const { id, ...colaboradorData } = editingColaborador;
        await updateDoc(colaboradorDoc, colaboradorData);
        console.log("Colaborador atualizado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao atualizar colaborador:", error);
      }
    } else {
      try {
        await addDoc(collection(db, "colaboradores"), newColaborador);
        console.log("Colaborador adicionado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao adicionar colaborador:", error);
      }
    }
  };

  const handleDeleteColaborador = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este colaborador?")) {
      try {
        const colaboradorDoc = doc(db, "colaboradores", id);
        await deleteDoc(colaboradorDoc);
        console.log("Colaborador excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir colaborador:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Colaboradores</h1>
          <p className="text-muted-foreground">Cadastre e gerencie seus colaboradores</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingColaborador ? "Editar Colaborador" : "Cadastrar Novo Colaborador"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSaveColaborador} className="space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={editingColaborador?.nome || newColaborador.nome}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  value={editingColaborador?.cargo || newColaborador.cargo}
                  onChange={handleInputChange}
                  placeholder="Ex: Lavador, Polidor, Gerente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={editingColaborador?.telefone || newColaborador.telefone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editingColaborador?.email || newColaborador.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <DialogFooter className="mt-4 flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingColaborador ? "Salvar Alterações" : "Cadastrar Colaborador"}
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
              placeholder="Buscar por nome, cargo, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Colaboradores Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Colaboradores ({filteredColaboradores.length})</span>
            <span className="text-sm text-muted-foreground">Total: {colaboradores.length} colaboradores</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id} className="hover:bg-muted/50">
                    <TableCell>{colaborador.nome}</TableCell>
                    <TableCell>{colaborador.cargo}</TableCell>
                    <TableCell>{colaborador.telefone}</TableCell>
                    <TableCell>{colaborador.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(colaborador)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteColaborador(colaborador.id)}>
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
