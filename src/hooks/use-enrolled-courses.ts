import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface EnrolledCourse {
  id: string;
  start_date: string;
  completion_date: string | null;
  status: string;
  courses: {
    id: string;
    title: string;
    image_url: string | null;
    instructor: string | null;
    category: string | null;
  };
}

export function useEnrolledCourses() {
  const { user } = useAuth();

  return useSupabaseQuery<EnrolledCourse[], Error>({
    queryKey: ["enrolledCourses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(
          `
          id,
          start_date,
          completion_date,
          status,
          courses (
            id,
            title,
            image_url,
            instructor,
            category
          )
        `
        )
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as EnrolledCourse[];
    },
    enabled: !!user,
  });
}