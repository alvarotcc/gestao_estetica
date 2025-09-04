import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
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
const mockChecklists = [
  { id: "1", vehicle: "Ford Mustang", tasks: [{ id: "1", name: "Verificar pneus", completed: false }, { id: "2", name: "Testar luzes", completed: true }] },
  { id: "2", vehicle: "Chevrolet Camaro", tasks: [{ id: "3", name: "Verificar freios", completed: false }] },
];

interface ChecklistTask {
  id: string;
  name: string;
  completed: boolean;
}

interface ChecklistEntry {
  id: string;
  vehicle: string;
  tasks: ChecklistTask[];
}

export default function Checklist() {
  const [checklists, setChecklists] = useState<ChecklistEntry[]>(mockChecklists);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState("");

  const handleAddChecklist = () => {
    if (newVehicle.trim() !== "") {
      const newEntry: ChecklistEntry = {
        id: Date.now().toString(),
        vehicle: newVehicle,
        tasks: [],
      };
      setChecklists([...checklists, newEntry]);
      setNewVehicle("");
      setIsDialogOpen(false);
    }
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklists(checklists.filter(c => c.id !== id));
  };

  const handleToggleTask = (checklistId: string, taskId: string) => {
    setChecklists(checklists.map(checklist =>
      checklist.id === checklistId
        ? {
            ...checklist,
            tasks: checklist.tasks.map(task =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : checklist
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Checklist de Veículos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Checklist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Checklist</DialogTitle>
              <DialogDescription>
                Adicione um novo veículo para iniciar o checklist.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicle" className="text-right">Veículo</Label>
                <Input id="vehicle" value={newVehicle} onChange={(e) => setNewVehicle(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddChecklist}>Criar Checklist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {checklists.map(checklist => (
          <Card key={checklist.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{checklist.vehicle}</CardTitle>
                <CardDescription>
                  {checklist.tasks.filter(t => t.completed).length} de {checklist.tasks.length} tarefas concluídas.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteChecklist(checklist.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarefa</TableHead>
                    <TableHead className="w-1/5 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklist.tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(checklist.id, task.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Adicionar nova tarefa..." className="flex-1" />
                        <Button variant="outline" size="sm">Adicionar</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
        {checklists.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>Nenhum checklist criado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
