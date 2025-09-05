// src/pages/Materiais.tsx
import { useState, useEffect } from "react";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Material {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
}

export default function Materiais() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    nome: "",
    quantidade: 0,
    unidade: ""
  });

  useEffect(() => {
    const materialsCollection = collection(db, "materiais");
    const unsubscribe = onSnapshot(materialsCollection, (snapshot) => {
      const materialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Material[];
      setMaterials(materialsData);
    }, (error) => {
      console.error("Erro ao buscar materiais: ", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredMaterials = materials.filter(material =>
    material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.unidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingMaterial) {
      setEditingMaterial(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewMaterial({ ...newMaterial, [name]: value });
    }
  };

  const handleOpenDialog = (material: Material | null = null) => {
    if (material) {
      setEditingMaterial(material);
    } else {
      setNewMaterial({
        nome: "",
        quantidade: 0,
        unidade: ""
      });
      setEditingMaterial(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewMaterial({
      nome: "",
      quantidade: 0,
      unidade: ""
    });
    setEditingMaterial(null);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      try {
        const materialDoc = doc(db, "materiais", editingMaterial.id);
        const { id, ...materialData } = editingMaterial;
        await updateDoc(materialDoc, materialData);
        console.log("Material atualizado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao atualizar material:", error);
      }
    } else {
      try {
        await addDoc(collection(db, "materiais"), newMaterial);
        console.log("Material adicionado com sucesso!");
        handleCloseDialog();
      } catch (error) {
        console.error("Erro ao adicionar material:", error);
      }
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este material?")) {
      try {
        const materialDoc = doc(db, "materiais", id);
        await deleteDoc(materialDoc);
        console.log("Material excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir material:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Materiais</h1>
          <p className="text-muted-foreground">Controle o estoque de materiais</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? "Editar Material" : "Cadastrar Novo Material"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSaveMaterial} className="space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Material *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={editingMaterial?.nome || newMaterial.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Shampoo Automotivo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  value={editingMaterial?.quantidade || newMaterial.quantidade}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade *</Label>
                <Input
                  id="unidade"
                  name="unidade"
                  value={editingMaterial?.unidade || newMaterial.unidade}
                  onChange={handleInputChange}
                  placeholder="Ex: litros, unidades"
                  required
                />
              </div>
              <DialogFooter className="mt-4 flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingMaterial ? "Salvar Alterações" : "Cadastrar Material"}
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
              placeholder="Buscar por nome ou unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Materiais ({filteredMaterials.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {materials.length} itens
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{material.nome}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.quantidade}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{material.unidade}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(material)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteMaterial(material.id)}>
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
