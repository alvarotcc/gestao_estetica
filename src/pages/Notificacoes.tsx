import { useState } from "react";
import { Bell, AlertTriangle, CheckCircle, Clock, Car, User, FileText, DollarSign, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";



export default function Notificacoes() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState("todas");

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { variant: "secondary" as const, label: "Baixa", color: "text-blue-600" },
      medium: { variant: "outline" as const, label: "Média", color: "text-yellow-600" },
      high: { variant: "destructive" as const, label: "Alta", color: "text-red-600" }
    };
    const conf = config[priority as keyof typeof config] || config.low;
    return (
      <Badge variant={conf.variant} className={conf.color}>
        {conf.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ordem_pendente":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "manutencao_atrasada":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "manutencao_proxima":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "pagamento_pendente":
        return <DollarSign className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "todas") return true;
    if (activeTab === "altas") return notification.priority === "high";
    if (activeTab === "medias") return notification.priority === "medium";
    if (activeTab === "baixas") return notification.priority === "low";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === "high").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
            <p className="text-muted-foreground">Acompanhe alertas e pendências do sistema</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="px-3 py-1">
            {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prioridade Alta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="altas">
            Altas ({notifications.filter(n => n.priority === "high").length})
          </TabsTrigger>
          <TabsTrigger value="medias">
            Médias ({notifications.filter(n => n.priority === "medium").length})
          </TabsTrigger>
          <TabsTrigger value="baixas">
            Baixas ({notifications.filter(n => n.priority === "low").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        notification.read ? "bg-muted/30" : "bg-muted/50 border-primary/20"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          disabled={notification.read}
                        >
                          {notification.read ? "Lida" : "Marcar como lida"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>Ver Ordens Pendentes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Car className="w-6 h-6" />
              <span>Agendar Manutenções</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={markAllAsRead}>
              <Bell className="w-6 h-6" />
              <span>Marcar Todas como Lidas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
