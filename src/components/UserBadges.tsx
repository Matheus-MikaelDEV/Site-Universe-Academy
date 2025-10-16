import React from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserBadges } from "@/hooks/use-user-badges";

export const UserBadges = () => {
  const { data: badges, isLoading, error } = useUserBadges();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Conquistas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div className="text-destructive">Erro ao carregar conquistas: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Minhas Conquistas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge.id} variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                {badge.badge_name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma conquista ainda. Comece um curso para ganhar sua primeira!</p>
        )}
      </CardContent>
    </Card>
  );
};