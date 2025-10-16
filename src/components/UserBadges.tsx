import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";

interface UserBadge {
  id: string;
  badge_name: string;
  awarded_at: string;
}

export const UserBadges = () => {
  const { user, loading: authLoading } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("awarded_at", { ascending: false });

      if (error) {
        showError("Erro ao carregar conquistas: " + error.message);
      } else {
        setBadges(data || []);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchBadges();
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Minhas Conquistas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length > 0 ? (
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