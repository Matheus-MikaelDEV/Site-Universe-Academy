import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { BookCopy, MessageSquare, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { showError } from "@/utils/toast";

interface Stats {
  users: number;
  courses: number;
  feedbacks: number;
}

interface Feedback {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

interface MonthlySignupData {
  month: string;
  count: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [monthlySignups, setMonthlySignups] = useState<MonthlySignupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { count: userCount, error: userCountError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        if (userCountError) throw userCountError;

        const { count: courseCount, error: courseCountError } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true });
        if (courseCountError) throw courseCountError;

        const { data: feedbackData, count: feedbackCount, error: feedbackError } = await supabase
          .from("feedbacks")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(5);
        if (feedbackError) throw feedbackError;

        const { data: signupsData, error: signupsError } = await supabase
          .rpc('get_monthly_signups');
        if (signupsError) throw signupsError;

        setStats({
          users: userCount ?? 0,
          courses: courseCount ?? 0,
          feedbacks: feedbackCount ?? 0,
        });
        
        setRecentFeedbacks(feedbackData as Feedback[] || []);
        setMonthlySignups(signupsData as MonthlySignupData[] || []);

      } catch (error: any) {
        showError("Erro ao carregar dados do painel: " + error.message);
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats?.users}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
          <BookCopy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats?.courses}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats?.feedbacks}</div>}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Novos Usuários por Mês</CardTitle>
          <CardDescription>Visão geral dos registros de usuários ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySignups} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    activeDot={{ r: 8 }}
                    name="Usuários Registrados"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Feedbacks Recentes</CardTitle>
          <CardDescription>As últimas 5 mensagens enviadas pelos usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeedbacks.length > 0 ? recentFeedbacks.map((feedback) => (
                <div key={feedback.id} className="flex items-start gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarFallback>{feedback.name?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{feedback.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{feedback.message}</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Nenhum feedback recebido ainda.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}