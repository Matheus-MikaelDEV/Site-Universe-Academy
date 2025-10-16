export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  instructor: string | null;
  image_url: string | null;
  created_at: string;
}