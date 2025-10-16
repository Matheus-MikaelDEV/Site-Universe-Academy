import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { Course } from "@/types/course";

export function useAdminCourses() {
  return useSupabaseQuery<Course[], Error>({
    queryKey: ["adminCourses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
  });
}