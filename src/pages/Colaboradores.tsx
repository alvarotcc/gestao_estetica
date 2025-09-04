import { useState, useEffect } from "react";
import { UserCheck, Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Employee {
  id: string;
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
}

const initialEmployeeState = {
  nome: "",
  cargo: "",
  telefone: "",
  email: ""
};

export default function Colaboradores() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployee, setNewEmployee] = useState(initialEmployeeState);

  useEffect(() => {
    const employeesCollection = collection(db, "colaboradores");
    const unsubscribe = onSnapshot(employeesCollection, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
      setEmployees(employeesData);
    }, (error) => {
      console.error("Erro ao buscar colaboradores: ", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredEmployees = employees.filter(employee =>
    employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.telefone.includes(searchTerm)
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewEmployee({ ...newEmployee, [id]: value });
  };
  
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "colaboradores"), newEmployee);
      setNewEmployee(initialEmployeeState); // Clear form
      console.log("Colaborador adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar colaborador:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Colaboradores</h1>
          <p className="text-muted-foreground">Gerencie a equipe de colaboradores</p>
        </div>
        
        <Button className="bg-gradient-primary hover:shadow-glow transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, cargo ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Colaboradores ({filteredEmployees.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {employees.length} colaboradores
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{employee.nome}</div>
                      <div className="text-sm text-muted-foreground">{employee.email}</div>
                    </TableCell>
                    <TableCell>{employee.cargo}</TableCell>
                    <TableCell>{employee.telefone}</TableCell>
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
