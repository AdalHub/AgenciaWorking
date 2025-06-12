// This version allows any string for the fields
export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  description: string;
  employmentType: string;
  team: string;
  location: string;
  posted: string;
}
