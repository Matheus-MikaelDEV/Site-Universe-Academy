import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAdminFeedbacks } from "@/hooks/use-admin-feedbacks";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminFeedbackPage() {
  const { data: feedbacks, isLoading, error } = useAdminFeedbacks();

  if (error) {
    return <div className="text-destructive">Erro ao carregar feedbacks: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualizar Feedbacks</CardTitle>
        <CardDescription>Veja as mensagens enviadas pelos usuários.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mensagem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))
            ) : feedbacks && feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{format(new Date(feedback.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell>{feedback.name}</TableCell>
                  <TableCell>{feedback.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{feedback.message}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center">Nenhum feedback encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}