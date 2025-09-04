import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
} from "firebase/firestore";
import { db } from "../main";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";

const clientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const { userId } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  // Fetch clients from Firestore
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "users", userId, "clientes"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientsArray: Client[] = [];
      querySnapshot.forEach((doc) => {
        clientsArray.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(clientsArray);
    }, (error) => {
      console.error("Error fetching clients: ", error);
      toast.error("Erro ao buscar clientes.");
    });

    return () => unsubscribe();
  }, [userId]);

  const handleSave = async (data: ClientFormData) => {
    try {
      if (currentClient) {
        // Update client
        const clientDoc = doc(db, "users", userId, "clientes", currentClient.id);
        await updateDoc(clientDoc, data);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        // Add new client
        await addDoc(collection(db, "users", userId, "clientes"), data);
        toast.success("Cliente adicionado com sucesso!");
      }
      setIsDialogOpen(false);
      setCurrentClient(null);
      reset();
    } catch (e) {
      console.error("Error adding/updating document: ", e);
      toast.error("Erro ao salvar cliente.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", userId, "clientes", id));
      toast.success("Cliente excluído com sucesso!");
    } catch (e) {
      console.error("Error removing document: ", e);
      toast.error("Erro ao excluir cliente.");
    }
  };

  const handleEdit = (client: Client) => {
    setCurrentClient(client);
    reset(client);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentClient(null);
    reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentClient ? "Editar Cliente" : "Adicionar Cliente"}</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente para salvar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleSave)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input id="name" {...register("name")} className="col-span-3" />
                </div>
                {errors.name && <p className="col-span-4 text-sm text-destructive">{errors.name.message}</p>}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Telefone</Label>
                  <Input id="phone" {...register("phone")} className="col-span-3" />
                </div>
                {errors.phone && <p className="col-span-4 text-sm text-destructive">{errors.phone.message}</p>}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">E-mail</Label>
                  <Input id="email" {...register("email")} className="col-span-3" />
                </div>
                {errors.email && <p className="col-span-4 text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <DialogFooter>
                <Button type="submit">{currentClient ? "Salvar Alterações" : "Adicionar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Gerencie todos os clientes do seu estúdio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
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
