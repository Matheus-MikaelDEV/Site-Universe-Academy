import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/contexts/AuthContext";

export function useAdminUsers() {
  return useSupabaseQuery<Profile[], Error>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_users_with_email');
      
      if (error) throw error;
      return data as Profile[];
    },
  });
}