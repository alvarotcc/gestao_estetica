import { useState } from "react";
import { Plus, Minus, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Material {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
}

interface MovimentacaoEstoqueProps {
  material: Material;
  onMovimentacao: () => void;
}

export default function MovimentacaoEstoque({ material, onMovimentacao }: MovimentacaoEstoqueProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState(0);
  const [motivo, setMotivo] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantidade <= 0) {
      alert("A quantidade deve ser maior que zero!");
      return;
    }

    if (tipo === "saida" && quantidade > material.quantidade) {
      alert("Quantidade insuficiente em estoque!");
      return;
    }

    try {
      // Registrar movimentação
      await addDoc(collection(db, "movimentacoes_estoque"), {
        materialId: material.id,
        materialNome: material.nome,
        tipo,
        quantidade,
        motivo,
        observacoes,
        data: new Date().toISOString(),
        quantidadeAnterior: material.quantidade,
        quantidadeNova: tipo === "entrada"
          ? material.quantidade + quantidade
          : material.quantidade - quantidade
      });

      // Atualizar quantidade do material
      const novaQuantidade = tipo === "entrada"
        ? material.quantidade + quantidade
        : material.quantidade - quantidade;

      const materialDoc = doc(db, "materiais", material.id);
      await updateDoc(materialDoc, {
        quantidade: novaQuantidade,
        [tipo === "entrada" ? "dataUltimaEntrada" : "dataUltimaSaida"]: new Date().toISOString()
      });

      alert(`Movimentação de ${tipo} registrada com sucesso!`);
      setIsDialogOpen(false);
      setQuantidade(0);
      setMotivo("");
      setObservacoes("");
      onMovimentacao();
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error);
      alert("Erro ao registrar movimentação!");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Package className="w-4 h-4 mr-1" />
          Movimentar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentação de Estoque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleMovimentacao} className="space-y-4">
          <div className="space-y-2">
            <Label>Material</Label>
            <div className="p-2 bg-muted rounded-md">
              <div className="font-medium">{material.nome}</div>
              <div className="text-sm text-muted-foreground">
                Estoque atual: {material.quantidade} {material.unidade}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Movimentação *</Label>
            <Select value={tipo} onValueChange={(value: "entrada" | "saida") => setTipo(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-green-600" />
                    Entrada
                  </div>
                </SelectItem>
                <SelectItem value="saida">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-red-600" />
                    Saída
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {tipo === "entrada" ? (
                  <>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="devolucao">Devolução</SelectItem>
                    <SelectItem value="ajuste">Ajuste de Estoque</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="consumo">Consumo Interno</SelectItem>
                    <SelectItem value="perda">Perda/Descarte</SelectItem>
                    <SelectItem value="ajuste">Ajuste de Estoque</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Registrar Movimentação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
