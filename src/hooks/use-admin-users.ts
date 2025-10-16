import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/contexts/AuthContext";

export function useAdminUsers() {
  return useSupabaseQuery<Profile[], Error>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, cpf, role") // Explicitly select email from auth.users if needed, or ensure it's in profiles
        .order("full_name");
      
      if (error) throw error;

      // Fetch emails from auth.users separately and merge, as profiles table doesn't store email directly
      const userIds = data.map(p => p.id);
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000, // Adjust as needed for larger user bases
      });

      if (authError) {
        console.error("Error fetching auth users:", authError);
        // Fallback: return profiles without email if auth users cannot be fetched
        return data.map(profile => ({ ...profile, email: null })) as Profile[];
      }

      const usersWithEmail = data.map(profile => {
        const authUser = authUsers?.users.find(au => au.id === profile.id);
        return { ...profile, email: authUser?.email || null };
      });

      return usersWithEmail as Profile[];
    },
  });
}