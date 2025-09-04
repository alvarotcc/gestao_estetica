import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";

// Mock data for vehicles
const mockVehicles = [
  { id: "1", brand: "Chevrolet", model: "Onix", year: 2022, licensePlate: "ABC-1234" },
  { id: "2", brand: "Ford", model: "Ka", year: 2020, licensePlate: "XYZ-5678" },
  { id: "3", brand: "Volkswagen", model: "Gol", year: 2021, licensePlate: "DEF-9012" },
];

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
}

export default function Veiculos() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newVehicle = {
      brand: form.marca.value,
      model: form.modelo.value,
      year: parseInt(form.ano.value),
      licensePlate: form.placa.value,
    };

    if (currentVehicle) {
      setVehicles(vehicles.map(v => v.id === currentVehicle.id ? { ...v, ...newVehicle, id: v.id } : v));
    } else {
      setVehicles([...vehicles, { ...newVehicle, id: Date.now().toString() }]);
    }

    setIsDialogOpen(false);
    setCurrentVehicle(null);
  };

  const handleDelete = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const handleEdit = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setIsDialogOpen(true);
  };

const handleAdd = () => {
    setCurrentVehicle(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Veículos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Veículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentVehicle ? "Editar Veículo" : "Adicionar Veículo"}</DialogTitle>
              <DialogDescription>
                Preencha os dados do veículo para salvar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="marca" className="text-right">Marca</Label>
                  <Input id="marca" name="marca" className="col-span-3" defaultValue={currentVehicle?.brand || ''} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="modelo" className="text-right">Modelo</Label>
                  <Input id="modelo" name="modelo" className="col-span-3" defaultValue={currentVehicle?.model || ''} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ano" className="text-right">Ano</Label>
                  <Input id="ano" name="ano" type="number" className="col-span-3" defaultValue={currentVehicle?.year || ''} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="placa" className="text-right">Placa</Label>
                  <Input id="placa" name="placa" className="col-span-3" defaultValue={currentVehicle?.licensePlate || ''} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{currentVehicle ? "Salvar Alterações" : "Adicionar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Veículos</CardTitle>
          <CardDescription>
            Gerencie os veículos cadastrados na sua estética.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
