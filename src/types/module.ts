export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  pdf_url: string | null;
  module_order: number;
  created_at: string;
}