import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data
const mockColaboradores = [
  { id: "1", name: "João Silva", role: "Detalhes", phone: "(47) 98888-8888" },
  { id: "2", name: "Maria Oliveira", role: "Polimento", phone: "(47) 97777-7777" },
];

interface Colaborador {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(mockColaboradores);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");

  const resetForm = () => {
    setEditingColaborador(null);
    setName("");
    setRole("");
    setPhone("");
  };

  const handleAddOrUpdateColaborador = () => {
    if (name.trim() !== "" && role.trim() !== "" && phone.trim() !== "") {
      if (editingColaborador) {
        setColaboradores(colaboradores.map(c => c.id === editingColaborador.id ? { ...editingColaborador, name, role, phone } : c));
      } else {
        const newColaborador: Colaborador = {
          id: Date.now().toString(),
          name,
          role,
          phone,
        };
        setColaboradores([...colaboradores, newColaborador]);
      }
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleDeleteColaborador = (id: string) => {
    setColaboradores(colaboradores.filter(c => c.id !== id));
  };

  const handleEditColaborador = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setName(colaborador.name);
    setRole(colaborador.role);
    setPhone(colaborador.phone);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Colaboradores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingColaborador ? "Editar Colaborador" : "Novo Colaborador"}</DialogTitle>
              <DialogDescription>
                {editingColaborador ? "Atualize as informações do colaborador." : "Adicione um novo colaborador para o estúdio."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Função</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Telefone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddOrUpdateColaborador}>
                {editingColaborador ? "Salvar Alterações" : "Adicionar Colaborador"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores.map(colaborador => (
                <TableRow key={colaborador.id}>
                  <TableCell className="font-medium">{colaborador.name}</TableCell>
                  <TableCell>{colaborador.role}</TableCell>
                  <TableCell>{colaborador.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditColaborador(colaborador)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteColaborador(colaborador.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {colaboradores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum colaborador cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
