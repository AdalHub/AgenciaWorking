export interface JobPosting {
  id: string;
  title: string;
  description: string;
  employmentType: string;
  team: string;
  location: string;
  slug: string;
  posted: string; // ✅ ISO 8601 date string (YYYY-MM-DD)
}
