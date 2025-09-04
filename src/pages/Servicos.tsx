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

interface Service {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
}

export default function Servicos() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
        
        <Button className="bg-gradient-primary hover:shadow-glow transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
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
