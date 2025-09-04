import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Eye, Edit, Trash2, Gift, Phone, Mail, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data
const clientsData = [
  {
    id: 1,
    nome: "João Silva",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    cpfCnpj: "123.456.789-10",
    aniversario: "1985-03-15",
    observacoes: "Cliente VIP",
    veiculos: 2,
    servicos: 15
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "(11) 88888-8888",
    email: "maria@email.com",
    cpfCnpj: "987.654.321-00",
    aniversario: "1990-07-22",
    observacoes: "Prefere agendamentos de manhã",
    veiculos: 1,
    servicos: 8
  },
  {
    id: 3,
    nome: "Pedro Costa",
    telefone: "(11) 77777-7777",
    email: "pedro@email.com",
    cpfCnpj: "456.789.123-45",
    aniversario: "1988-12-10",
    observacoes: "",
    veiculos: 3,
    servicos: 22
  }
];

export default function Clientes() {
  const [clients, setClients] = useState(clientsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Cadastre e gerencie seus clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" placeholder="Nome completo do cliente" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input id="cpfCnpj" placeholder="000.000.000-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aniversario">Data de Aniversário</Label>
                  <Input id="aniversario" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" placeholder="Informações adicionais sobre o cliente" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  Cadastrar Cliente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Clientes ({filteredClients.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {clients.length} clientes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Aniversário</TableHead>
                  <TableHead>Veículos</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.nome}</div>
                        {client.observacoes && (
                          <div className="text-sm text-muted-foreground">{client.observacoes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" />
                          {client.telefone}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(client.aniversario).toLocaleDateString('pt-BR')}
                        </span>
                        {new Date(client.aniversario).getMonth() === new Date().getMonth() && (
                          <Gift className="w-4 h-4 text-accent" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.veiculos} veículo(s)</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client.servicos} serviços</Badge>
                    </TableCell>
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