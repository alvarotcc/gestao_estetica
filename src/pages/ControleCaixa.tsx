import { useState, useEffect } from "react";
import { DollarSign, Plus, Minus, TrendingUp, TrendingDown, AlertTriangle, Calendar, User, Receipt } from "lucide-react";
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
import { collection, onSnapshot, addDoc, doc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

interface CashMovement {
  id: string;
  tipo: "entrada" | "saida";
  valor: number;
  descricao: string;
  data: string;
  hora: string;
  usuarioId: string;
  usuarioNome: string;
  categoria: string;
  formaPagamento?: string;
  observacoes?: string;
}

interface CashOpening {
  id: string;
  data: string;
  valorInicial: number;
  usuarioId: string;
  usuarioNome: string;
  status: "aberto" | "fechado";
  valorFinal?: number;
  diferenca?: number;
}

const categoriasEntradas = [
  "Vendas",
  "Serviços",
  "Recebimentos",
  "Outros"
];

const categoriasSaidas = [
  "Compras",
  "Despesas",
  "Pagamentos",
  "Sangria",
  "Outros"
];

const formasPagamento = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "PIX",
  "Transferência"
];

export default function ControleCaixa() {
  const { user, userData } = useAuth();
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [cashOpenings, setCashOpenings] = useState<CashOpening[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<CashMovement | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<"entrada" | "saida">("entrada");
  const [currentOpening, setCurrentOpening] = useState<CashOpening | null>(null);

  const [newMovement, setNewMovement] = useState({
    categoria: "",
    descricao: "",
    valor: 0,
    formaPagamento: "",
    observacoes: ""
  });

  const [newOpening, setNewOpening] = useState({
    valorInicial: 0
  });

  useEffect(() => {
    // Buscar movimentos do caixa
    const movementsCollection = collection(db, "movimentos_caixa");
    const movementsQuery = query(movementsCollection, orderBy("data", "desc"), orderBy("hora", "desc"));
    const unsubscribeMovements = onSnapshot(movementsQuery, (snapshot) => {
      const movementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CashMovement[];
      setMovements(movementsData);
    });

    // Buscar aberturas de caixa
    const openingsCollection = collection(db, "aberturas_caixa");
    const openingsQuery = query(openingsCollection, orderBy("data", "desc"));
    const unsubscribeOpenings = onSnapshot(openingsQuery, (snapshot) => {
      const openingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CashOpening[];
      setCashOpenings(openingsData);

      // Verificar se há caixa aberto hoje
      const today = new Date().toISOString().split('T')[0];
      const todayOpening = openingsData.find(opening =>
        opening.data === today && opening.status === "aberto"
      );
      setCurrentOpening(todayOpening || null);
    });

    return () => {
      unsubscribeMovements();
      unsubscribeOpenings();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingMovement) {
      setEditingMovement(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewMovement({ ...newMovement, [name]: value });
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    if (editingMovement) {
      setEditingMovement(prev => prev ? { ...prev, [field]: value } : null);
    } else {
      setNewMovement({ ...newMovement, [field]: value });
    }
  };

  const handleOpenDialog = (movement: CashMovement | null = null, tipo: "entrada" | "saida" = "entrada") => {
    if (movement) {
      setEditingMovement(movement);
      setSelectedTipo(movement.tipo);
    } else {
      setEditingMovement(null);
      setSelectedTipo(tipo);
      setNewMovement({
        categoria: "",
        descricao: "",
        valor: 0,
        formaPagamento: "",
        observacoes: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMovement(null);
    setNewMovement({
      categoria: "",
      descricao: "",
      valor: 0,
      formaPagamento: "",
      observacoes: ""
    });
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOpening) {
      alert("É necessário abrir o caixa antes de registrar movimentos!");
      return;
    }

    const now = new Date();
    const movementData: Omit<CashMovement, 'id'> = {
      tipo: selectedTipo,
      categoria: editingMovement?.categoria || newMovement.categoria,
      descricao: editingMovement?.descricao || newMovement.descricao,
      valor: editingMovement?.valor || newMovement.valor,
      data: now.toISOString().split('T')[0],
      hora: now.toTimeString().split(' ')[0],
      usuarioId: user?.uid || "",
      usuarioNome: userData?.name || "Usuário",
      formaPagamento: editingMovement?.formaPagamento || newMovement.formaPagamento,
      observacoes: editingMovement?.observacoes || newMovement.observacoes
    };

    try {
      if (editingMovement) {
        const movementDoc = doc(db, "movimentos_caixa", editingMovement.id);
        await updateDoc(movementDoc, movementData);
        console.log("Movimento atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "movimentos_caixa"), movementData);
        console.log("Movimento criado com sucesso!");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao salvar movimento:", error);
    }
  };

  const handleOpenCash = async () => {
    if (!newOpening.valorInicial || newOpening.valorInicial < 0) {
      alert("Valor inicial deve ser maior ou igual a zero!");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const openingData: Omit<CashOpening, 'id'> = {
      data: today,
      valorInicial: newOpening.valorInicial,
      usuarioId: user?.uid || "",
      usuarioNome: userData?.name || "Usuário",
      status: "aberto"
    };

    try {
      await addDoc(collection(db, "aberturas_caixa"), openingData);
      console.log("Caixa aberto com sucesso!");
      setNewOpening({ valorInicial: 0 });
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
    }
  };

  const handleCloseCash = async () => {
    if (!currentOpening) return;

    const todayMovements = movements.filter(m =>
      m.data === currentOpening.data
    );

    const entradas = todayMovements
      .filter(m => m.tipo === "entrada")
      .reduce((total, m) => total + m.valor, 0);

    const saidas = todayMovements
      .filter(m => m.tipo === "saida")
      .reduce((total, m) => total + m.valor, 0);

    const valorFinal = currentOpening.valorInicial + entradas - saidas;

    try {
      const openingDoc = doc(db, "aberturas_caixa", currentOpening.id);
      await updateDoc(openingDoc, {
        status: "fechado",
        valorFinal,
        diferenca: 0 // Em uma implementação real, isso seria calculado com o valor contado
      });
      console.log("Caixa fechado com sucesso!");
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
    }
  };

  // Cálculos
  const today = new Date().toISOString().split('T')[0];
  const todayMovements = movements.filter(m => m.data === today);

  const entradasHoje = todayMovements
    .filter(m => m.tipo === "entrada")
    .reduce((total, m) => total + m.valor, 0);

  const saidasHoje = todayMovements
    .filter(m => m.tipo === "saida")
    .reduce((total, m) => total + m.valor, 0);

  const saldoAtual = currentOpening
    ? currentOpening.valorInicial + entradasHoje - saidasHoje
    : 0;

  // Dados para gráficos
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayMovements = movements.filter(m => m.data === date);
    const entradas = dayMovements.filter(m => m.tipo === "entrada").reduce((total, m) => total + m.valor, 0);
    const saidas = dayMovements.filter(m => m.tipo === "saida").reduce((total, m) => total + m.valor, 0);
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      entradas,
      saidas,
      saldo: entradas - saidas
    };
  });

  const getTipoBadge = (tipo: string) => {
    return tipo === "entrada" ? (
      <Badge className="bg-green-100 text-green-800">
        <Plus className="w-3 h-3 mr-1" />
        Entrada
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <Minus className="w-3 h-3 mr-1" />
        Saída
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Caixa</h1>
          <p className="text-muted-foreground">Gerencie entradas e saídas do caixa diariamente</p>
        </div>

        <div className="flex gap-2">
          {!currentOpening ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Abrir Caixa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Abrir Caixa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="valorInicial">Valor Inicial</Label>
                    <Input
                      id="valorInicial"
                      type="number"
                      step="0.01"
                      value={newOpening.valorInicial}
                      onChange={(e) => setNewOpening({ valorInicial: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleOpenCash}>Abrir Caixa</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleOpenDialog(null, "entrada")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Entrada
                  </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleOpenDialog(null, "saida")}
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Saída
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                onClick={handleCloseCash}
              >
                Fechar Caixa
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status do Caixa */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Status do Caixa - {new Date().toLocaleDateString('pt-BR')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentOpening ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Valor Inicial</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {currentOpening.valorInicial.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {entradasHoje.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {saidasHoje.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldoAtual.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Caixa Fechado</p>
              <p className="text-muted-foreground">Abra o caixa para começar a registrar movimentos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Fluxo de Caixa */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Fluxo de Caixa - Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
              <Line type="monotone" dataKey="saldo" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Movimentos de Hoje */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Movimentos de Hoje ({todayMovements.length})</span>
            <Badge variant="secondary" className="text-sm">
              {todayMovements.length} movimentos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayMovements.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {movement.hora}
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(movement.tipo)}</TableCell>
                    <TableCell>{movement.categoria}</TableCell>
                    <TableCell>{movement.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={movement.tipo === "entrada" ? "text-green-600" : "text-red-600"}>
                        R$ {movement.valor.toLocaleString('pt-BR')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {movement.usuarioNome}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Movimento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingMovement ? "Editar Movimento" : `Novo ${selectedTipo === "entrada" ? "Entrada" : "Saída"}`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSaveMovement} className="space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={editingMovement?.categoria || newMovement.categoria}
                  onValueChange={(value) => handleSelectChange("categoria", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedTipo === "entrada" ? categoriasEntradas : categoriasSaidas).map((categoria) => (
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
                  value={editingMovement?.descricao || newMovement.descricao}
                  onChange={handleInputChange}
                  placeholder="Descrição do movimento"
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
                  value={editingMovement?.valor || newMovement.valor}
                  onChange={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    if (editingMovement) {
                      setEditingMovement(prev => prev ? { ...prev, valor } : null);
                    } else {
                      setNewMovement({ ...newMovement, valor });
                    }
                  }}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select
                  value={editingMovement?.formaPagamento || newMovement.formaPagamento}
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
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={editingMovement?.observacoes || newMovement.observacoes}
                  onChange={handleInputChange}
                  placeholder="Observações adicionais..."
                />
              </div>

              <DialogFooter className="mt-4 flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" className={selectedTipo === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                  {editingMovement ? "Salvar Alterações" : "Registrar Movimento"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
