import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
}

export function useUserNotifications(limit?: number) {
  const { user } = useAuth();

  return useSupabaseQuery<Notification[], Error>({
    queryKey: ["userNotifications", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });
}