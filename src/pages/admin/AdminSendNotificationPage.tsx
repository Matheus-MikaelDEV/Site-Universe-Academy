import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationForm } from "@/components/admin/NotificationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";

export default function AdminSendNotificationPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Enviar Notificação</CardTitle>
          <CardDescription>Envie mensagens para usuários específicos ou para todos.</CardDescription>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <BellRing className="mr-2 h-4 w-4" />
          Nova Notificação
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Clique em "Nova Notificação" para enviar uma mensagem.
        </p>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Notificação</DialogTitle>
          </DialogHeader>
          <NotificationForm onSuccess={handleFormSuccess} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}