import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Car } from "lucide-react";

const todayAppointments = [
  {
    id: 1,
    time: "08:00",
    client: "João Silva",
    vehicle: "Honda Civic 2020",
    service: "Lavagem Completa",
    status: "confirmado"
  },
  {
    id: 2,
    time: "10:30",
    client: "Maria Santos",
    vehicle: "Toyota Corolla 2019",
    service: "Polimento",
    status: "em_andamento"
  },
  {
    id: 3,
    time: "14:00",
    client: "Pedro Costa",
    vehicle: "VW Golf 2021",
    service: "Higienização Interna",
    status: "agendado"
  },
  {
    id: 4,
    time: "16:30",
    client: "Ana Paula",
    vehicle: "Nissan Sentra 2018",
    service: "Enceramento",
    status: "agendado"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmado":
      return "bg-success text-success-foreground";
    case "em_andamento":
      return "bg-primary text-primary-foreground";
    case "agendado":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "confirmado":
      return "Confirmado";
    case "em_andamento":
      return "Em Andamento";
    case "agendado":
      return "Agendado";
    default:
      return "Agendado";
  }
};

export function TodaySchedule() {
  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Agendamentos de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayAppointments.map((appointment) => (
          <div 
            key={appointment.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {appointment.time}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{appointment.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{appointment.vehicle}</span>
                </div>
                <p className="text-sm font-medium text-primary">{appointment.service}</p>
              </div>
            </div>
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}