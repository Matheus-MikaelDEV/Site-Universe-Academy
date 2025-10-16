import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";

interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export function useAdminFeedbacks() {
  return useSupabaseQuery<Feedback[], Error>({
    queryKey: ["adminFeedbacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Feedback[];
    },
  });
}