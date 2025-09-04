import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Agenda() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agenda de Agendamentos</h1>
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Em desenvolvimento</CardTitle>
          <CardDescription>Esta página ainda está a ser desenvolvida.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">O calendário e a lógica de agendamentos serão adicionados em breve.</p>
        </CardContent>
      </Card>
    </div>
  );
}
