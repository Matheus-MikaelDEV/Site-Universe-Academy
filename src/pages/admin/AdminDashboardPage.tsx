import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { BookCopy, MessageSquare, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: courseCount } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true });

        const { data: feedbackData, count: feedbackCount } = await supabase
          .from("feedbacks")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          users: userCount ?? 0,
          courses: courseCount ?? 0,
          feedbacks: feedbackCount ?? 0,
        });
        
        setRecentFeedbacks(feedbackData as Feedback[] || []);

      } catch (error) {
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