import { useState, useEffect } from "react";
import { DollarSign, Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, PieChart, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface Transaction {
  id: string;
  tipo: "receita" | "despesa";
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  formaPagamento?: string;
  clienteId?: string;
  clienteNome?: string;
  ordemServicoId?: string;
  observacoes?: string;
}

interface Client {
  id: string;
  nome: string;
}

const categoriasReceitas = [
  "Serviços Realizados",
  "Produtos Vendidos",
  "Outros"
];

const categoriasDespesas = [
  "Materiais",
  "Salários",
  "Aluguel",
  "Contas",
  "Marketing",
  "Equipamentos",
  "Outros"
];

const formasPagamento = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "PIX",
  "Boleto",
  "Transferência"
];

export default function Financeiro() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<"receita" | "despesa">("receita");
  const [newTransaction, setNewTransaction] = useState({
    categoria: "",
    descricao: "",
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    formaPagamento: "",
    clienteId: "",
    ordemServicoId: "",
    observacoes: ""
  });

  useEffect(() => {
    // Buscar transações
    const transactionsCollection = collection(db, "transacoes");
    const unsubscribeTransactions = onSnapshot(transactionsCollection, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(transactionsData);
    });

    // Buscar clientes
    const clientsCollection = collection(db, "clientes");
    const unsubscribeClients = onSnapshot(clientsCollection, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      })) as Client[];
      setClients(clientsData);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeClients();
    };
  }, []);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.clienteNome && transaction.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingTransaction) {
      setEditingTransaction(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewTransaction({ ...newTransaction, [name]: value });
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    if (editingTransaction) {
      setEditingTransaction(prev => prev ? { ...prev, [field]: value } : null);
    } else {
      setNewTransaction({ ...newTransaction, [field]: value });
    }
  };

  const handleOpenDialog = (transaction: Transaction | null = null, tipo: "receita" | "despesa" = "receita") => {
    if (transaction) {
      setEditingTransaction(transaction);
      setSelectedTipo(transaction.tipo);
    } else {
      setEditingTransaction(null);
      setSelectedTipo(tipo);
      setNewTransaction({
        categoria: "",
        descricao: "",
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        formaPagamento: "",
        clienteId: "",
        ordemServicoId: "",
        observacoes: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
    setNewTransaction({
      categoria: "",
      descricao: "",
      valor: 0,
      data: new Date().toISOString().split('T')[0],
      formaPagamento: "",
      clienteId: "",
      ordemServicoId: "",
      observacoes: ""
    });
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    const transactionData: Omit<Transaction, 'id'> = {
      tipo: selectedTipo,
      categoria: editingTransaction?.categoria || newTransaction.categoria,
      descricao: editingTransaction?.descricao || newTransaction.descricao,
      valor: editingTransaction?.valor || newTransaction.valor,
      data: editingTransaction?.data || newTransaction.data,
      formaPagamento: editingTransaction?.formaPagamento || newTransaction.formaPagamento,
      clienteId: editingTransaction?.clienteId || newTransaction.clienteId,
      clienteNome: editingTransaction?.clienteId ? clients.find(c => c.id === editingTransaction.clienteId)?.nome : clients.find(c => c.id === newTransaction.clienteId)?.nome,
      ordemServicoId: editingTransaction?.ordemServicoId || newTransaction.ordemServicoId,
      observacoes: editingTransaction?.observacoes || newTransaction.observacoes
    };

    try {
      if (editingTransaction) {
        const transactionDoc = doc(db, "transacoes", editingTransaction.id);
        await updateDoc(transactionDoc, transactionData);
        console.log("Transação atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "transacoes"), transactionData);
        console.log("Transação criada com sucesso!");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        const transactionDoc = doc(db, "transacoes", id);
        await deleteDoc(transactionDoc);
        console.log("Transação excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir transação:", error);
      }
    }
  };

  // Cálculos financeiros
  const totalReceitas = transactions
    .filter(t => t.tipo === "receita")
    .reduce((total, t) => total + t.valor, 0);

  const totalDespesas = transactions
    .filter(t => t.tipo === "despesa")
    .reduce((total, t) => total + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  // Dados para gráficos
  const chartData = [
    { name: "Receitas", value: totalReceitas, color: "#10b981" },
    { name: "Despesas", value: totalDespesas, color: "#ef4444" }
  ];

  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.data).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { receitas: 0, despesas: 0 };
    }
    if (transaction.tipo === "receita") {
      acc[month].receitas += transaction.valor;
    } else {
      acc[month].despesas += transaction.valor;
    }
    return acc;
  }, {} as Record<string, { receitas: number; despesas: number }>);

  const monthlyChartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    receitas: data.receitas,
    despesas: data.despesas
  }));

  const getTipoBadge = (tipo: string) => {
    return tipo === "receita" ? (
      <Badge className="bg-green-100 text-green-800">
        <TrendingUp className="w-3 h-3 mr-1" />
        Receita
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <TrendingDown className="w-3 h-3 mr-1" />
        Despesa
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle Financeiro</h1>
          <p className="text-muted-foreground">Gerencie receitas e despesas do negócio</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleOpenDialog(null, "receita")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => handleOpenDialog(null, "despesa")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesas.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldo.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Receitas vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Fluxo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por descrição, categoria ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transações ({filteredTransactions.length})</span>
            <Badge variant="secondary" className="text-sm">
              Total: {transactions.length} transações
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(transaction.data).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(transaction.tipo)}</TableCell>
                    <TableCell>{transaction.categoria}</TableCell>
                    <TableCell>{transaction.descricao}</TableCell>
                    <TableCell>{transaction.clienteNome || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={transaction.tipo === "receita" ? "text-green-600" : "text-red-600"}>
                        R$ {transaction.valor.toLocaleString('pt-BR')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(transaction)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTransaction(transaction.id)}>
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

      {/* Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Editar Transação" : `Nova ${selectedTipo === "receita" ? "Receita" : "Despesa"}`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSaveTransaction} className="space-y-4 pr-2">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={editingTransaction?.categoria || newTransaction.categoria}
                onValueChange={(value) => handleSelectChange("categoria", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedTipo === "receita" ? categoriasReceitas : categoriasDespesas).map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                name="descricao"
                value={editingTransaction?.descricao || newTransaction.descricao}
                onChange={handleInputChange}
                placeholder="Descrição da transação"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                value={editingTransaction?.valor || newTransaction.valor}
                onChange={(e) => {
                  const valor = parseFloat(e.target.value) || 0;
                  if (editingTransaction) {
                    setEditingTransaction(prev => prev ? { ...prev, valor } : null);
                  } else {
                    setNewTransaction({ ...newTransaction, valor });
                  }
                }}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                name="data"
                type="date"
                value={editingTransaction?.data || newTransaction.data}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Select
                value={editingTransaction?.formaPagamento || newTransaction.formaPagamento}
                onValueChange={(value) => handleSelectChange("formaPagamento", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente (opcional)</Label>
              <Select
                value={editingTransaction?.clienteId || newTransaction.clienteId}
                onValueChange={(value) => handleSelectChange("clienteId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={editingTransaction?.observacoes || newTransaction.observacoes}
                onChange={handleInputChange}
                placeholder="Observações adicionais..."
              />
            </div>

            <DialogFooter className="mt-4 flex-shrink-0">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className={selectedTipo === "receita" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                {editingTransaction ? "Salvar Alterações" : "Criar Transação"}
              </Button>
            </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
