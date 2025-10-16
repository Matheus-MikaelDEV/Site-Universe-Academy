import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface UserBadge {
  id: string;
  badge_name: string;
  awarded_at: string;
}

export function useUserBadges() {
  const { user } = useAuth();

  return useSupabaseQuery<UserBadge[], Error>({
    queryKey: ["userBadges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("awarded_at", { ascending: false });
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user,
  });
}