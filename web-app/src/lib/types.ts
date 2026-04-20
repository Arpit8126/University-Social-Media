// ========================================
// Swastik Platform - TypeScript Types
// ========================================

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  role: 'Student' | 'Moderator' | 'Co-Admin' | 'Admin' | 'Owner';
  is_verified: boolean;
  is_banned: boolean;
  university_id: string | null;
  created_at: string;
  updated_at: string;
  universities?: { name: string } | null;
}

export interface Post {
  id: string;
  content: string;
  media_url: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  user_id: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: Profile | null;
  user_has_liked?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'avatar_url' | 'username'> | null;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'PUBLIC' | 'PRIVATE' | 'SEMI_PUBLIC';
  emoji: string;
  created_by: string;
  university_id: string | null;
  member_count: number;
  is_official: boolean;
  rules: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  user_role?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'ADMIN' | 'CO_ADMIN' | 'MODERATOR' | 'MEMBER';
  joined_at: string;
  profiles?: Pick<Profile, 'full_name' | 'avatar_url' | 'username'> | null;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_text: string | null;
  last_message_at: string | null;
  participant?: Profile | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url: string | null;
  message_type: 'text' | 'image' | 'audio' | 'video';
  is_read: boolean;
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'avatar_url'> | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPT' | 'GROUP_INVITE' | 'SYSTEM' | 'MESSAGE';
  title: string;
  content: string | null;
  link: string | null;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Pick<Profile, 'full_name' | 'avatar_url'> | null;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'NOTES' | 'PYQ' | 'ASSIGNMENT' | 'REFERENCE';
  file_url: string;
  file_name: string | null;
  file_size: string | null;
  uploaded_by: string;
  university_id: string | null;
  downloads: number;
  is_verified: boolean;
  subject: string | null;
  semester: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'username'> | null;
}

export interface AnonymousPost {
  id: string;
  content: string;
  upvotes: number;
  comments_count: number;
  created_at: string;
  user_has_upvoted?: boolean;
}

export interface AnonymousComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  sender?: Pick<Profile, 'full_name' | 'avatar_url' | 'username'> | null;
  receiver?: Pick<Profile, 'full_name' | 'avatar_url' | 'username'> | null;
}

// =====================
// Phase 2 Types
// =====================

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  message_type: 'text' | 'image' | 'audio' | 'system' | 'call';
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'avatar_url' | 'username'> | null;
}

export interface GroupCall {
  id: string;
  group_id: string;
  initiated_by: string;
  status: 'ACTIVE' | 'ENDED';
  participant_count: number;
  started_at: string;
  ended_at: string | null;
  initiator?: Pick<Profile, 'full_name' | 'avatar_url'> | null;
}

export interface PersonalCall {
  id: string;
  caller_id: string;
  receiver_id: string;
  status: 'RINGING' | 'ACTIVE' | 'ENDED' | 'MISSED' | 'REJECTED';
  call_type: 'audio' | 'video';
  started_at: string;
  answered_at: string | null;
  ended_at: string | null;
}

