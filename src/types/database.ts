export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'moderator' | 'admin';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Experienced';
export type AvailabilityType = 'Few hours per week' | 'Weekends' | 'Part-time' | 'Flexible' | 'Full-time';
export type CollaborationFormat = 'In person' | 'Remote' | 'Hybrid';
export type ProjectStage = 'Idea' | 'Validation' | 'Prototype' | 'MVP' | 'Early launch' | 'Growing';
export type ProjectStatus = 'active' | 'closed' | 'archived';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ReportReason = 'Spam' | 'Harassment' | 'Fake identity' | 'Inappropriate content' | 'Fraud or suspicious activity' | 'Other';
export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string;
  university: string | null;
  experience_level: ExperienceLevel | null;
  collaboration_goals: string[] | null;
  availability: AvailabilityType | null;
  collaboration_format: CollaborationFormat | null;
  discoverable: boolean;
  profile_visibility: 'public' | 'connections_only' | 'private';
  is_interested_in_business: string | null;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
  skills?: Skill[];
  interests?: Interest[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technology' | 'Business' | 'Creative' | 'Other';
  created_at: string;
}

export interface Interest {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  problem_description: string;
  solution_description: string | null;
  category: string;
  stage: ProjectStage;
  city: string;
  collaboration_format: CollaborationFormat;
  commitment_expectation: string;
  visibility: 'public' | 'unlisted';
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  skills?: Skill[];
  roles?: ProjectRole[];
  members_count?: number;
  likes_count?: number;
  comments_count?: number;
  has_liked?: boolean;
  image_url?: string | null;
}

export interface ProjectRole {
  id: string;
  project_id: string;
  role_name: string;
  description: string | null;
  filled: boolean;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  status: 'active' | 'left' | 'removed';
  joined_at: string;
  profile?: Profile;
}

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  project_id: string | null;
  message: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  receiver?: Profile;
  project?: Project;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  members?: Profile[];
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  sender?: Profile;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  applicant_id: string;
  message: string;
  availability_note: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  applicant?: Profile;
  project?: Project;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'connection_request' | 'connection_accepted' | 'project_application' | 'application_accepted' | 'application_rejected' | 'new_message' | 'project_like' | 'project_comment' | 'project_advice';
  title: string;
  body: string;
  related_entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_project_id: string | null;
  reported_message_id: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
  reporter?: Profile;
  reported_user?: Profile;
  reported_project?: Project;
}

export interface ProjectLike {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ProjectAdvice {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}
