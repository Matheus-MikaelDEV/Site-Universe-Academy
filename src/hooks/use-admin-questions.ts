import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

export function useAdminQuestions(moduleId: string | undefined) {
  return useSupabaseQuery<Question[], Error>({
    queryKey: ["adminQuestions", moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("module_id", moduleId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!moduleId,
  });
}