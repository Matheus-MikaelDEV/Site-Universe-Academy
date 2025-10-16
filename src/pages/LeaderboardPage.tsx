import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";

interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
}

const LeaderboardPage = () => {
  const { data: leaderboard, isLoading, error } = useSupabaseQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, points")
        .order("points", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  if (error) {
    return <div className="text-destructive">Erro ao carregar leaderboard: {error.message}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <CardTitle className="text-4xl font-bold mb-2">Leaderboard</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Veja os alunos com as maiores pontuações!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.avatar_url || undefined} alt={entry.full_name || "Aluno"} />
                            <AvatarFallback>{entry.full_name?.[0] || "A"}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.full_name || "Aluno Anônimo"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">{entry.points}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Nenhum aluno no leaderboard ainda.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;