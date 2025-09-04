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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collection, onSnapshot } from "firebase/firestore";
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Materiais</h1>
          <p className="text-muted-foreground">Controle o estoque de materiais</p>
        </div>
        
        <Button className="bg-gradient-primary hover:shadow-glow transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Novo Material
        </Button>
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
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
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
