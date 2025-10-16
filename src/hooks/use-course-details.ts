import { useSupabaseQuery } from "./use-supabase-query";
import { supabase } from "@/lib/supabaseClient";
import { Course } from "@/types/course";
import { Module } from "@/types/module";
import { useAuth } from "@/contexts/AuthContext";

interface ModuleWithProgress extends Module {
  is_completed: boolean;
}

interface CourseDetails {
  course: Course | null;
  modules: ModuleWithProgress[];
  isEnrolled: boolean;
  courseCompletionPercentage: number;
}

export function useCourseDetails(courseId: string | undefined) {
  const { user } = useAuth();

  return useSupabaseQuery<CourseDetails, Error>({
    queryKey: ["courseDetails", courseId, user?.id],
    queryFn: async () => {
      if (!courseId) return { course: null, modules: [], isEnrolled: false, courseCompletionPercentage: 0 };

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      
      if (courseError) console.error("Error fetching course:", courseError);

      let isEnrolled = false;
      let modules: ModuleWithProgress[] = [];
      let courseCompletionPercentage = 0;

      if (user) {
        // Check enrollment status
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("course_enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();
        
        if (enrollmentData) {
          isEnrolled = true;
          // Fetch modules and their completion status if enrolled
          const { data: modulesData, error: modulesError } = await supabase
            .from("modules")
            .select(`
              *,
              course_progress(is_completed)
            `)
            .eq("course_id", courseId)
            .order("module_order");
          
          if (modulesError) {
            console.error("Error fetching modules:", modulesError);
          } else {
            modules = modulesData.map(m => ({
              ...m,
              is_completed: m.course_progress.length > 0 ? m.course_progress[0].is_completed : false
            }));

            const completedCount = modules.filter(m => m.is_completed).length;
            const totalCount = modules.length;
            if (totalCount > 0) {
              courseCompletionPercentage = Math.round((completedCount / totalCount) * 100);
            }
          }
        }
      }

      return {
        course: courseData as Course | null,
        modules,
        isEnrolled,
        courseCompletionPercentage,
      };
    },
    enabled: !!courseId,
  });
}