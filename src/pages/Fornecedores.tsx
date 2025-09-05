import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
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
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface Fornecedor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cnpj: string;
  endereco: string;
  contato: string;
  categoria: string;
  observacoes: string;
}

const initialFornecedorState = {
  nome: "",
  telefone: "",
  email: "",
  cnpj: "",
  endereco: "",
  contato: "",
  categoria: "",
  observacoes: ""
};

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFornecedor, setNewFornecedor] = useState(initialFornecedorState);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    const fornecedoresCollection = collection(db, "fornecedores");
    const unsubscribe = onSnapshot(fornecedoresCollection, (snapshot) => {
      const fornecedoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Fornecedor[];
      setFornecedores(fornecedoresData);
    }, (error) => {
      console.error("Erro ao buscar fornecedores: ", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.telefone.includes(searchTerm) ||
    fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cnpj.includes(searchTerm) ||
    fornecedor.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (editingFornecedor) {
      setEditingFornecedor(prev => prev ? { ...prev, [id]: value } : null);
    } else {
      setNewFornecedor({ ...newFornecedor, [id]: value });
    }
  };

  const handleOpenDialog = (fornecedor: Fornecedor | null = null) => {
    if (fornecedor) {
      setEditingFornecedor(fornecedor);
    } else {
      setNewFornecedor(initialFornecedorState);
      setEditingFornecedor(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewFornecedor(initialFornecedorState);
    setEditingFornecedor(null);
  };

  const handleSaveFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFornecedor) {
      try {
        const fornecedorDoc = doc(db, "fornecedores", editingFornecedor.id);
        const { id, ...fornecedorData } = editingFornecedor;
        await updateDoc(fornecedorDoc, fornecedorData);
        console.log("Fornecedor atualizado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao atualizar fornecedor:", error);
      }
    } else {
      try {
        const fornecedorData = {
          ...newFornecedor,
          createdBy: userData?.uid,
          createdAt: new Date(),
        };
        await addDoc(collection(db, "fornecedores"), fornecedorData);
        console.log("Fornecedor adicionado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao adicionar fornecedor:", error);
      }
    }
  };

  const handleDeleteFornecedor = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este fornecedor?")) {
      try {
        const fornecedorDoc = doc(db, "fornecedores", id);
        await deleteDoc(fornecedorDoc);
        console.log("Fornecedor excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground">Controle os fornecedores da empresa</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingFornecedor ? "Editar Fornecedor" : "Cadastrar Novo Fornecedor"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSaveFornecedor} className="space-y-4 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input id="nome" value={editingFornecedor?.nome || newFornecedor.nome} onChange={handleInputChange} placeholder="Nome do fornecedor" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input id="telefone" value={editingFornecedor?.telefone || newFornecedor.telefone} onChange={handleInputChange} placeholder="(11) 99999-9999" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={editingFornecedor?.email || newFornecedor.email} onChange={handleInputChange} placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" value={editingFornecedor?.cnpj || newFornecedor.cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" value={editingFornecedor?.endereco || newFornecedor.endereco} onChange={handleInputChange} placeholder="Endereço completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contato">Contato</Label>
                    <Input id="contato" value={editingFornecedor?.contato || newFornecedor.contato} onChange={handleInputChange} placeholder="Pessoa de contato" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input id="categoria" value={editingFornecedor?.categoria || newFornecedor.categoria} onChange={handleInputChange} placeholder="Materiais, Equipamentos, etc." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={editingFornecedor?.observacoes || newFornecedor.observacoes} onChange={handleInputChange} placeholder="Informações adicionais sobre o fornecedor" />
                </div>
                <DialogFooter className="mt-4 flex-shrink-0">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    {editingFornecedor ? "Salvar Alterações" : "Cadastrar Fornecedor"}
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
              placeholder="Buscar por nome, telefone, email, CNPJ ou categoria..."
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
            <span>Lista de Fornecedores ({filteredFornecedores.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFornecedores.map((fornecedor) => (
                  <TableRow key={fornecedor.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{fornecedor.nome}</div>
                        <div className="text-sm text-muted-foreground">{fornecedor.endereco}</div>
                        {fornecedor.observacoes && (
                          <div className="text-sm text-muted-foreground">{fornecedor.observacoes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <div>{fornecedor.contato}</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div>{fornecedor.telefone}</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div>{fornecedor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{fornecedor.categoria}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(fornecedor)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteFornecedor(fornecedor.id)}>
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
