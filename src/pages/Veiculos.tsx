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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  clienteId: string;
}

export default function Veiculos() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const vehiclesCollection = collection(db, "veiculos");
    const unsubscribe = onSnapshot(vehiclesCollection, (snapshot) => {
      const vehiclesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehiclesData);
    }, (error) => {
      console.error("Erro ao buscar veículos: ", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Veículos</h1>
          <p className="text-muted-foreground">Cadastre e gerencie os veículos de seus clientes</p>
        </div>
        
        <Button className="bg-gradient-primary hover:shadow-glow transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Novo Veículo
        </Button>
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
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-muted/50">
                    <TableCell>
                      {/* TODO: Buscar nome do cliente por clienteId */}
                      <div className="font-medium">{vehicle.clienteId}</div>
                    </TableCell>
                    <TableCell>{vehicle.marca}</TableCell>
                    <TableCell>{vehicle.modelo}</TableCell>
                    <TableCell>{vehicle.placa}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
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
