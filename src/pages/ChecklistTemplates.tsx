import { useState, useEffect } from "react";
import { CheckSquare, Plus, Edit, Trash2, Copy, Save, X, FileText, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChecklistTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  itens: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItem {
  id: string;
  texto: string;
  obrigatorio: boolean;
  ordem: number;
}

export default function ChecklistTemplates() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    itens: [] as ChecklistItem[]
  });
  const [newItem, setNewItem] = useState({ texto: "", obrigatorio: false });

  useEffect(() => {
    const templatesCollection = collection(db, "checklist_templates");
    const unsubscribe = onSnapshot(templatesCollection, (snapshot) => {
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChecklistTemplate[];
      setTemplates(templatesData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTemplate = async () => {
    if (!newTemplate.nome.trim() || !newTemplate.categoria) return;

    try {
      await addDoc(collection(db, "checklist_templates"), {
        ...newTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setNewTemplate({ nome: "", descricao: "", categoria: "", itens: [] });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar template:", error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await updateDoc(doc(db, "checklist_templates", selectedTemplate.id), {
        ...selectedTemplate,
        updatedAt: new Date().toISOString()
      });

      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      try {
        await deleteDoc(doc(db, "checklist_templates", id));
      } catch (error) {
        console.error("Erro ao excluir template:", error);
      }
    }
  };

  const handleDuplicateTemplate = async (template: ChecklistTemplate) => {
    try {
      const { id, ...templateData } = template;
      await addDoc(collection(db, "checklist_templates"), {
        ...templateData,
        nome: `${templateData.nome} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao duplicar template:", error);
    }
  };

  const addItemToTemplate = () => {
    if (!newItem.texto.trim()) return;

    const item: ChecklistItem = {
      id: Date.now().toString(),
      texto: newItem.texto,
      obrigatorio: newItem.obrigatorio,
      ordem: (selectedTemplate?.itens.length || 0) + 1
    };

    if (selectedTemplate) {
      setSelectedTemplate({
        ...selectedTemplate,
        itens: [...selectedTemplate.itens, item]
      });
    } else {
      setNewTemplate({
        ...newTemplate,
        itens: [...newTemplate.itens, item]
      });
    }

    setNewItem({ texto: "", obrigatorio: false });
  };

  const removeItemFromTemplate = (itemId: string) => {
    if (selectedTemplate) {
      setSelectedTemplate({
        ...selectedTemplate,
        itens: selectedTemplate.itens.filter(item => item.id !== itemId)
      });
    } else {
      setNewTemplate({
        ...newTemplate,
        itens: newTemplate.itens.filter(item => item.id !== itemId)
      });
    }
  };

  const getCategoriaBadge = (categoria: string) => {
    const colors = {
      "Manutenção": "bg-blue-100 text-blue-800",
      "Revisão": "bg-green-100 text-green-800",
      "Reparo": "bg-red-100 text-red-800",
      "Estética": "bg-purple-100 text-purple-800",
      "Outro": "bg-gray-100 text-gray-800"
    };
    return colors[categoria as keyof typeof colors] || colors["Outro"];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Templates de Checklist</h1>
            <p className="text-muted-foreground">Gerencie checklists personalizados para seus serviços</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Template</label>
                <Input
                  value={newTemplate.nome}
                  onChange={(e) => setNewTemplate({...newTemplate, nome: e.target.value})}
                  placeholder="Ex: Checklist de Revisão Completa"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={newTemplate.descricao}
                  onChange={(e) => setNewTemplate({...newTemplate, descricao: e.target.value})}
                  placeholder="Descrição do template..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select value={newTemplate.categoria} onValueChange={(value) => setNewTemplate({...newTemplate, categoria: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Revisão">Revisão</SelectItem>
                    <SelectItem value="Reparo">Reparo</SelectItem>
                    <SelectItem value="Estética">Estética</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Itens do Checklist */}
              <div>
                <label className="text-sm font-medium">Itens do Checklist</label>
                <div className="space-y-2 mt-2">
                  {newTemplate.itens.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox checked={item.obrigatorio} disabled />
                      <span className="flex-1">{item.texto}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItemFromTemplate(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newItem.texto}
                    onChange={(e) => setNewItem({...newItem, texto: e.target.value})}
                    placeholder="Novo item..."
                    onKeyPress={(e) => e.key === 'Enter' && addItemToTemplate()}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newItem.obrigatorio}
                      onCheckedChange={(checked) => setNewItem({...newItem, obrigatorio: checked as boolean})}
                    />
                    <label className="text-sm">Obrigatório</label>
                  </div>
                  <Button onClick={addItemToTemplate} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTemplate}>
                Criar Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="border-0 shadow-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{template.descricao}</p>
                </div>
                <Badge className={getCategoriaBadge(template.categoria)}>
                  {template.categoria}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{template.itens.length} itens</span>
                  <span>•</span>
                  <span>{template.itens.filter(item => item.obrigatorio).length} obrigatórios</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Atualizado em {format(new Date(template.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Template</label>
                <Input
                  value={selectedTemplate.nome}
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, nome: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={selectedTemplate.descricao}
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, descricao: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select value={selectedTemplate.categoria} onValueChange={(value) => setSelectedTemplate({...selectedTemplate, categoria: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Revisão">Revisão</SelectItem>
                    <SelectItem value="Reparo">Reparo</SelectItem>
                    <SelectItem value="Estética">Estética</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Itens do Checklist */}
              <div>
                <label className="text-sm font-medium">Itens do Checklist</label>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {selectedTemplate.itens.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox checked={item.obrigatorio} disabled />
                      <span className="flex-1">{item.texto}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItemFromTemplate(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newItem.texto}
                    onChange={(e) => setNewItem({...newItem, texto: e.target.value})}
                    placeholder="Novo item..."
                    onKeyPress={(e) => e.key === 'Enter' && addItemToTemplate()}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newItem.obrigatorio}
                      onCheckedChange={(checked) => setNewItem({...newItem, obrigatorio: checked as boolean})}
                    />
                    <label className="text-sm">Obrigatório</label>
                  </div>
                  <Button onClick={addItemToTemplate} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {templates.length === 0 && (
        <Card className="border-0 shadow-card">
          <CardContent className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro template de checklist para começar a organizar seus serviços.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
