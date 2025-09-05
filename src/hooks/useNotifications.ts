import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { differenceInDays } from "date-fns";

interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  veiculoId: string;
  veiculoPlaca: string;
  veiculoMarca: string;
  veiculoModelo: string;
  status: "aberta" | "em_andamento" | "concluida" | "cancelada";
  dataAbertura: string;
  dataConclusao?: string;
  valorTotal: number;
  desconto: number;
  valorFinal: number;
  observacoes: string;
}

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  clienteId: string;
  clienteNome: string;
  ultimaManutencao?: string;
  proximaManutencao?: string;
}

interface Notification {
  id: string;
  type: "ordem_pendente" | "manutencao_atrasada" | "manutencao_proxima" | "pagamento_pendente";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  relatedId: string;
  createdAt: string;
  read: boolean;
}

export function useNotifications() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Buscar ordens de serviço pendentes
    const ordensCollection = collection(db, "ordens_servico");
    const ordensQuery = query(
      ordensCollection,
      where("status", "in", ["aberta", "em_andamento"]),
      orderBy("dataAbertura", "desc")
    );
    const unsubscribeOrdens = onSnapshot(ordensQuery, (snapshot) => {
      const ordensData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrdemServico[];
      setOrdens(ordensData);
    });

    // Buscar veículos
    const vehiclesCollection = collection(db, "veiculos");
    const unsubscribeVehicles = onSnapshot(vehiclesCollection, (snapshot) => {
      const vehiclesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehiclesData);
    });

    return () => {
      unsubscribeOrdens();
      unsubscribeVehicles();
    };
  }, []);

  useEffect(() => {
    // Gerar notificações baseadas nos dados
    const generatedNotifications: Notification[] = [];

    // Notificações de ordens pendentes
    ordens.forEach((ordem) => {
      const daysSinceOpen = differenceInDays(new Date(), new Date(ordem.dataAbertura));
      let priority: "low" | "medium" | "high" = "low";
      let message = `Ordem de serviço ${ordem.numero} está ${ordem.status === "aberta" ? "aberta" : "em andamento"} há ${daysSinceOpen} dia(s)`;

      if (daysSinceOpen > 7) {
        priority = "high";
        message += " - ATENÇÃO: Ordem antiga!";
      } else if (daysSinceOpen > 3) {
        priority = "medium";
        message += " - Revisar andamento";
      }

      generatedNotifications.push({
        id: `ordem-${ordem.id}`,
        type: "ordem_pendente",
        title: `OS ${ordem.numero} - ${ordem.status === "aberta" ? "Aberta" : "Em Andamento"}`,
        message,
        priority,
        relatedId: ordem.id,
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    // Notificações de manutenção
    vehicles.forEach((vehicle) => {
      if (vehicle.proximaManutencao) {
        const proximaManutencao = new Date(vehicle.proximaManutencao);
        const hoje = new Date();
        const diasParaManutencao = differenceInDays(proximaManutencao, hoje);

        if (diasParaManutencao < 0) {
          // Manutenção atrasada
          generatedNotifications.push({
            id: `manutencao-atrasada-${vehicle.id}`,
            type: "manutencao_atrasada",
            title: `Manutenção Atrasada - ${vehicle.placa}`,
            message: `A manutenção do veículo ${vehicle.marca} ${vehicle.modelo} (${vehicle.placa}) está atrasada em ${Math.abs(diasParaManutencao)} dia(s)`,
            priority: "high",
            relatedId: vehicle.id,
            createdAt: new Date().toISOString(),
            read: false
          });
        } else if (diasParaManutencao <= 7) {
          // Manutenção próxima
          generatedNotifications.push({
            id: `manutencao-proxima-${vehicle.id}`,
            type: "manutencao_proxima",
            title: `Manutenção Próxima - ${vehicle.placa}`,
            message: `A manutenção do veículo ${vehicle.marca} ${vehicle.modelo} (${vehicle.placa}) está programada para ${diasParaManutencao} dia(s)`,
            priority: diasParaManutencao <= 3 ? "high" : "medium",
            relatedId: vehicle.id,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      }
    });

    setNotifications(generatedNotifications);
  }, [ordens, vehicles]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
