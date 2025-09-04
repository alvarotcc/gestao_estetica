import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";

// Mock data for services
const mockServices = [
  { id: "1", name: "Lavagem Detalhada", price: 150.00 },
  { id: "2", name: "Polimento Técnico", price: 350.00 },
  { id: "3", name: "Cristalização", price: 250.00 },
];

interface Service {
  id: string;
  name: string;
  price: number;
}

export default function Servicos() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newService = {
      name: form.name.value,
      price: parseFloat(form.price.value),
    };

    if (currentService) {
      setServices(services.map(s => s.id === currentService.id ? { ...s, ...newService, id: s.id } : s));
    } else {
      setServices([...services, { ...newService, id: Date.now().toString() }]);
    }

    setIsDialogOpen(false);
    setCurrentService(null);
  };

  const handleDelete = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentService(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Serviços</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentService ? "Editar Serviço" : "Adicionar Serviço"}</DialogTitle>
              <DialogDescription>
                Preencha os dados do serviço para salvar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input id="name" name="name" className="col-span-3" defaultValue={currentService?.name || ''} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Preço</Label>
                  <Input id="price" name="price" type="number" step="0.01" className="col-span-3" defaultValue={currentService?.price || ''} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{currentService ? "Salvar Alterações" : "Adicionar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>
            Gerencie todos os serviços oferecidos pela sua estética.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{`R$ ${service.price.toFixed(2)}`}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
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
