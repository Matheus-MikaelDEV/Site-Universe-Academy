import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { Course } from "@/types/course";

interface UseCoursesOptions {
  searchTerm?: string;
  category?: string;
  limit?: number;
}

export function useCourses(options?: UseCoursesOptions) {
  const { searchTerm, category, limit } = options || {};

  return useSupabaseQuery<Course[], Error>({
    queryKey: ["courses", searchTerm, category, limit],
    queryFn: async () => {
      let query = supabase.from("courses").select("id, title, category, instructor, image_url").order("title", { ascending: true });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,instructor.ilike.%${searchTerm}%`);
      }
      if (category && category !== "all") {
        query = query.eq("category", category);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useCourseCategories() {
  return useSupabaseQuery<string[], Error>({
    queryKey: ["courseCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("category")
        .not("category", "is", null);
      if (error) throw error;
      const uniqueCategories = Array.from(new Set(data.map((c) => c.category))).filter(Boolean) as string[];
      return uniqueCategories;
    },
  });
}