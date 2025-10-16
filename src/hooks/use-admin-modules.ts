import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { Module } from "@/types/module";

export function useAdminModules(courseId: string | undefined) {
  return useSupabaseQuery<Module[], Error>({
    queryKey: ["adminModules", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("module_order");
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId,
  });
}